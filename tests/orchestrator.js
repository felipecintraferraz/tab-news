import retry from "async-retry";
import database from "infra/database.js";
import session from "models/session.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import { faker } from "@faker-js/faker";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForEmailServer() {
    return retry(fetchPage(`${emailHttpUrl}`), {
      retries: 100,
      maxTimeout: 1000,
    });
  }

  async function waitForWebServer() {
    return retry(fetchPage(`${process.env.BASE_URL}/api/v1/status`), {
      retries: 100,
      maxTimeout: 1000,
    });
  }

  async function fetchPage(url) {
    const response = await fetch(url);
    await response.json();
  }
}

async function cleanDatabase() {
  return await database.cleanDatabase();
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const emailItem = emailListBody.at(-1);
  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${emailItem.id}.plain`,
  );
  emailItem.text = await emailTextResponse.text();
  return emailListBody.at(-1);
}

async function createUser({ username, email, password }) {
  const testUsername = username || faker.internet.username();
  const testEmail = email || faker.internet.email();
  const testPassword = password || faker.internet.password();

  const userCreated = await user.create({
    username: testUsername,
    email: testEmail,
    password: testPassword,
  });
  const userToReturn = {
    id: userCreated.id,
    username: userCreated.username,
    password: testPassword,
    email: userCreated.email,
    created_at: userCreated.created_at,
    updated_at: userCreated.updated_at,
  };

  return userToReturn;
}

async function createSession(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
