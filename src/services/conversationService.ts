import type OpenAI from "openai";
import type { Logger } from "../app/logger.js";
import type { AppConfig } from "../app/config.js";
import { OpenAIServiceError } from "../app/errors.js";
import type { KnowledgeService } from "./knowledgeService.js";
import type { UsageTracker } from "../ai/usageTracker.js";
import {
  assertBudgetAllowed,
  evaluateBudgetPolicy,
  summarizeUsage,
} from "../ai/budgetPolicy.js";
import { buildSystemPrompt, buildUserPrompt } from "../ai/buildPrompt.js";
import { formatDiscordReply } from "../ai/responseFormatter.js";
import { createRequestId } from "../utils/ids.js";

/**
 * Input required to generate a GUIDO response.
 */
export interface GenerateReplyInput {
  userQuestion: string;
  guildId?: string;
  channelId?: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Result of generating a GUIDO response.
 */
export interface GenerateReplyResult {
  requestId: string;
  replyText: string;
  blockedByBudget: boolean;
}

/**
 * ConversationService is responsible for:
 * - retrieving relevant local knowledge
 * - building the grounded AI prompt
 * - enforcing budget controls before any AI call
 * - recording usage estimates
 * - formatting the final Discord reply
 */
export class ConversationService {
  constructor(
    private readonly config: AppConfig,
    private readonly logger: Logger,
    private readonly openaiClient: OpenAI,
    private readonly knowledgeService: KnowledgeService,
    private readonly usageTracker: UsageTracker,
  ) {}

  async initialize(): Promise<void> {
    this.logger.info("Conversation service initialized", {
      event: "conversation.initialize",
      model: this.config.ai.model,
    });
  }

  /**
   * Generate a grounded GUIDO reply for a user's question.
   */
  async generateReply(input: GenerateReplyInput): Promise<GenerateReplyResult> {
    const requestId = createRequestId("ai");

    /**
     * Retrieve only a limited number of relevant chunks.
     *
     * This is one of the strongest cost-control mechanisms in the system:
     * we do not dump the whole rulebook into the prompt.
     */
    const retrievalResults = this.knowledgeService.retrieve(
      input.userQuestion,
      this.config.ai.limits.maxRetrievedChunks,
    );

    const retrievedChunks = retrievalResults.map((result) => result.chunk);
    const citations = this.knowledgeService.getCitations(retrievalResults);

    /**
     * Build the final prompt text sent to the model.
     */
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      userQuestion: input.userQuestion,
      retrievedChunks,
    });

    /**
     * Budget policy is enforced before we call OpenAI.
     *
     * This protects against:
     * - oversized inputs
     * - excessive output token caps
     * - single expensive requests
     * - daily/monthly budget overages
     */
    const allUsage = await this.usageTracker.getAllRecords();
    const usageSummary = summarizeUsage(allUsage);

    const budgetCheck = evaluateBudgetPolicy(this.config, {
      promptText: `${systemPrompt}\n\n${userPrompt}`,
      maxOutputTokens: this.config.ai.limits.maxOutputTokens,
      currentMonthSpendUsd: usageSummary.currentMonthSpendUsd,
      currentDaySpendUsd: usageSummary.currentDaySpendUsd,
    });

    this.logger.info("AI budget check complete", {
      event: "usage.budget_check",
      requestId,
      estimatedInputTokens: budgetCheck.estimatedInputTokens,
      estimatedRequestCostUsd: budgetCheck.estimatedRequestCostUsd,
      allowed: budgetCheck.allowed,
      reasons: budgetCheck.reasons,
      currentMonthSpendUsd: usageSummary.currentMonthSpendUsd,
      currentDaySpendUsd: usageSummary.currentDaySpendUsd,
    });

    /**
     * Throw if the request should be blocked under the current policy.
     */
    try {
      assertBudgetAllowed(this.config, budgetCheck);
    } catch (error) {
      this.logger.warn("AI request blocked by budget policy", {
        event: "usage.blocked",
        requestId,
        reasons: budgetCheck.reasons,
        estimatedRequestCostUsd: budgetCheck.estimatedRequestCostUsd,
      });

      return {
        requestId,
        blockedByBudget: true,
        replyText:
          "I checked the city budget ledger, and this request would exceed the current AI usage limits. Please try again later or contact staff if needed.",
      };
    }

    try {
      /**
       * Call OpenAI using the Responses API.
       *
       * We provide:
       * - one system instruction block
       * - one user block containing the grounded excerpts
       */
      const response = await this.openaiClient.responses.create({
        model: this.config.ai.model,
        max_output_tokens: this.config.ai.limits.maxOutputTokens,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: systemPrompt,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: userPrompt,
              },
            ],
          },
        ],
      });

      const answerText =
        response.output_text?.trim() ||
        "I checked the available documents, but I couldn't produce a clear answer from them.";

      /**
       * Record estimated usage after a successful AI request.
       *
       * For now this is estimate-based. Later we can enhance this using actual
       * usage values returned by the API when available.
       */
      await this.usageTracker.appendRecord({
        requestId,
        timestamp: new Date().toISOString(),
        model: this.config.ai.model,
        estimatedInputTokens: budgetCheck.estimatedInputTokens,
        maxOutputTokens: this.config.ai.limits.maxOutputTokens,
        estimatedCostUsd: budgetCheck.estimatedRequestCostUsd,
        sessionId: input.sessionId,
        channelId: input.channelId,
        guildId: input.guildId,
        userId: input.userId,
      });

      const replyText = formatDiscordReply(answerText, citations);

      this.logger.info("AI reply generated successfully", {
        event: "conversation.reply_generated",
        requestId,
        citationCount: citations.length,
        retrievedChunkCount: retrievedChunks.length,
        blockedByBudget: false,
      });

      return {
        requestId,
        blockedByBudget: false,
        replyText,
      };
    } catch (error) {
      throw new OpenAIServiceError(
        "Failed to generate AI reply",
        {
          requestId,
          guildId: input.guildId,
          channelId: input.channelId,
          userId: input.userId,
        },
        error,
      );
    }
  }
}