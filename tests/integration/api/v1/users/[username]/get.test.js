import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;
const ISO8601_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
let user;
beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  user = await orchestrator.createUser({
    username: "John_Doe",
  });
});

describe("API v1", () => {
  describe("GET /users/[username]", () => {
    describe("Anonymous user", () => {
      test("With exact case match username", async () => {
        const response = await fetch(`${url}/${user.username}`);
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: user.username,
          email: user.email,
          password: respBody.password,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(respBody.created_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.updated_at).toMatch(ISO8601_UTC_REGEX);
      });

      test("With case mismatch username", async () => {
        const response = await fetch(`${url}/${user.username.toLowerCase()}`);
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: user.username,
          email: user.email,
          password: respBody.password,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(respBody.created_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.updated_at).toMatch(ISO8601_UTC_REGEX);
      });

      test("With nonexistent username", async () => {
        const response = await fetch(`${url}/invalidUser`);
        expect(response.status).toBe(404);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 404,
          message: "User not found",
          action: "Check the provided property and value.",
          name: "ResourceNotFoundError",
        });
      });
    });
  });
});
