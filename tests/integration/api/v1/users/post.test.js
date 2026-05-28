import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("API v1", () => {
  describe("POST /users", () => {
    describe("Anonymous user", () => {
      test("With unique and valid data", async () => {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "john_doe",
            email: "john_doe@example.com",
            password: "123456",
          }),
        });
        const respBody = await response.json();
        expect(response.status).toBe(201);
        expect(respBody).toEqual({
          id: respBody.id,
          username: "john_doe",
          email: "john_doe@example.com",
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(Date.parse(respBody.created_at)).not.toBeNaN();
        expect(Date.parse(respBody.updated_at)).not.toBeNaN();
        expect(respBody.created_at).toEqual(respBody.updated_at);
      });

      test("Would not create with duplicated email", async () => {
        const response1 = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicated_email_user1",
            email: "duplicated@example.com",
            password: "1234567890",
          }),
        });
        expect(response1.status).toBe(201);

        const response2 = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicated_email_user2",
            email: "Duplicated@example.com",
            password: "1234567890",
          }),
        });
        expect(response2.status).toBe(400);
        const respBody2 = await response2.json();
        expect(respBody2).toEqual({
          statusCode: 400,
          name: "ValidationError",
          message: "Email already in use",
          action: "Use a different email",
        });
      });

      test("Would not create with duplicated username", async () => {
        const response1 = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicated_user",
            email: "duplicated1@example.com",
            password: "1234567890",
          }),
        });
        expect(response1.status).toBe(201);

        const response2 = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "dupLicated_user",
            email: "duplicated3@example.com",
            password: "123456ss7890",
          }),
        });
        expect(response2.status).toBe(400);
        const respBody2 = await response2.json();
        expect(respBody2).toEqual({
          statusCode: 400,
          name: "ValidationError",
          message: "Username already in use",
          action: "Use a different username",
        });
      });
    });
  });
});
