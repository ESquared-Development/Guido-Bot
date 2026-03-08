import type { Client } from "discord.js";
import type { Logger } from "./logger.js";

/**
 * Register process shutdown and fatal error handlers.
 */
export function registerShutdownHandlers(client: Client, logger: Logger): void {
  let shuttingDown = false;

  const shutdown = async (reason: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info("Shutdown initiated", {
      event: "app.shutdown.start",
      reason,
    });

    try {
      client.destroy();

      logger.info("Discord client destroyed", {
        event: "app.shutdown.discord_destroyed",
      });
    } catch (error) {
      logger.error("Failed while destroying Discord client", {
        event: "app.shutdown.destroy_failed",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", {
      event: "process.unhandled_rejection",
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", {
      event: "process.uncaught_exception",
      error: error.message,
      stack: error.stack,
    });

    void shutdown("uncaughtException");
  });
}