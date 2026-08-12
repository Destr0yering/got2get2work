import { buildApi } from "./app";
import { loadApiConfig } from "./config";
import { createProductionDependencies } from "./firebase";

async function main() {
  const config = loadApiConfig();
  const dependencies = createProductionDependencies(config);
  const app = await buildApi({ config, ...dependencies });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutdown_started");
    await app.close();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ host: config.host, port: config.port });
  } catch (error) {
    app.log.fatal({ err: error }, "startup_failed");
    process.exitCode = 1;
  }
}

void main();
