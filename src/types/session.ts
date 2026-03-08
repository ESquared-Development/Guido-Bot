export type GuideSessionState =
  | "CREATING"
  | "OPEN"
  | "IDLE_WARNING_SENT"
  | "CLOSING"
  | "CLOSED"
  | "ERROR";

export interface GuideSession {
  sessionId: string;
  guildId: string;
  memberId: string;
  lobbyChannelId: string;
  threadId: string;
  state: GuideSessionState;
  createdAt: string;
  updatedAt: string;
  lastMemberMessageAt?: string;
  lastBotMessageAt?: string;
  idleWarningSentAt?: string;
  closedAt?: string;
}