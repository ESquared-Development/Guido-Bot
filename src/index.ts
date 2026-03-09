import { bootstrapApp } from "./app/bootstrap.js";
import { registerShutdownHandlers } from "./app/shutdown.js";
import { registerDiscordHandlers } from "./discord/registerHandlers.js";

/**
 * Main application entry point.
 */
async function main(): Promise<void> {
  const app = await bootstrapApp();

  registerDiscordHandlers(app.discordClient, app.logger, {
    openaiClient: app.openaiClient,
    model: app.config.ai.model,
    maxOutputTokens: app.config.ai.limits.maxOutputTokens,
  });
  registerShutdownHandlers(app.discordClient, app.logger);

  app.logger.info("Attempting Discord login", {
    event: "discord.login.start",
  });

  await app.discordClient.login(app.config.discord.token);

  app.logger.info("Discord login completed", {
    event: "discord.login.complete",
  });
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "app.fatal",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }),
  );

  process.exit(1);
});
