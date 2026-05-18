import retry from "async-retry";
import database from "infra/database.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(`http://localhost:3000/api/v1/status`);
      await response.json();
    }
  }
}

async function cleanDatabase() {
  return await database.cleanDatabase();
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
};

export default orchestrator;
