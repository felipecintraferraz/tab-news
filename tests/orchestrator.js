import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`${process.env.BASE_URL}/api/v1/status`);
      await response.json();
    }
  }
}

async function cleanDatabase() {
  return await database.cleanDatabase();
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userInputValues) {
  return await user.create(userInputValues);
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
