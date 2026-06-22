import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import passwordUtil from "infra/password.js";
import { faker } from "@faker-js/faker";

const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;
let user1;
beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  user1 = await orchestrator.createUser({});
});

describe("API v1", () => {
  describe("PATCH /users/[username]", () => {
    describe("Anonymous user", () => {
      test("With nonexistent `username`", async () => {
        const invalidUrl = `${url}/invalidUser`;
        const response = await fetch(invalidUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "invalidUser",
            email: "invalidUser@example.com",
            password: "123456",
          }),
        });
        expect(response.status).toBe(404);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 404,
          message: "User not found",
          action: "Check the provided property and value.",
          name: "ResourceNotFoundError",
        });
      });

      test("Would not update with duplicated username", async () => {
        await orchestrator.createUser({
          username: "it_is_singular",
        });
        const response = await fetch(`${url}/it_is_singular`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: user1.username,
          }),
        });
        expect(response.status).toBe(400);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 400,
          name: "ValidationError",
          message: "Username already in use",
          action: "Use a different username",
        });
      });

      test("Would not update with duplicated email", async () => {
        const user2 = await orchestrator.createUser({});
        const response = await fetch(`${url}/${user1.username}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user2.email,
          }),
        });
        expect(response.status).toBe(400);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 400,
          name: "ValidationError",
          message: "Email already in use",
          action: "Use a different email",
        });
      });

      test("Would update with valid email value", async () => {
        const newEmail = faker.internet.email();
        const response = await fetch(`${url}/${user1.username}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newEmail,
          }),
        });
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: user1.username,
          email: newEmail,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
      });

      test("Would update with valid password value", async () => {
        const newPassword = faker.string.alphanumeric(10);
        const response = await fetch(`${url}/${user1.username}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        });
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: user1.username,
          email: respBody.email,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        const passwordHash = await user.getPasswordHashById(respBody.id);
        expect(passwordHash).not.toBe(newPassword);
        expect(await passwordUtil.compare(newPassword, passwordHash)).toBe(
          true,
        );
        expect(Date.parse(respBody.updated_at)).toBeGreaterThan(
          Date.parse(respBody.created_at),
        );
      });

      test("Would update multiple fields", async () => {
        const newUsername = faker.internet.username();
        const newEmail = faker.internet.email();
        const newPassword = faker.string.alphanumeric(10);
        const response = await fetch(`${url}/${user1.username}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: newUsername,
            email: newEmail,
            password: newPassword,
          }),
        });
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: newUsername,
          email: newEmail,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        const passwordHash = await user.getPasswordHashById(respBody.id);
        expect(passwordHash).not.toBe(newPassword);
        expect(await passwordUtil.compare(newPassword, passwordHash)).toBe(
          true,
        );
        expect(Date.parse(respBody.updated_at)).toBeGreaterThan(
          Date.parse(respBody.created_at),
        );
      });
    });
  });
});
