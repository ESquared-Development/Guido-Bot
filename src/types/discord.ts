export interface MessageRoutingDecision {
  shouldRespond: boolean;
  reason:
    | "MENTION"
    | "REPLY_TO_BOT"
    | "CITY_GUIDE_THREAD"
    | "IGNORED_BOT"
    | "IGNORED_EMPTY"
    | "IGNORED_UNMATCHED";
}