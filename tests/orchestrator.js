import retry from "async-retry";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import { faker } from "@faker-js/faker";

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

async function createUser({ username, email, password }) {
  const testUsername = username || faker.internet.username();
  const testEmail = email || faker.internet.email();
  const testPassword = password || faker.string.alphanumeric(10);

  const testUser = await user.create({
    username: testUsername,
    email: testEmail,
    password: testPassword,
  });

  return testUser;
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
