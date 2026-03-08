import { bootstrapApp } from "./app/bootstrap.js";
import { registerShutdownHandlers } from "./app/shutdown.js";
import { registerDiscordHandlers } from "./discord/registerHandlers.js";

async function main(): Promise<void> {
  const app = await bootstrapApp();

  registerDiscordHandlers(app.discordClient, app.logger);
  registerShutdownHandlers(app.discordClient, app.logger);

  app.logger.info("Logging into Discord", {
    event: "discord.login.start",
  });

  await app.discordClient.login(app.config.discord.token);

  app.logger.info("Discord login call completed", {
    event: "discord.login.complete",
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "app.fatal",
      message,
      stack,
    }),
  );

  process.exit(1);
});