import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";

const route = "/api/v1/session";
const url = `${process.env.BASE_URL}${route}`;
const ISO8601_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("API v1", () => {
  describe("POST /session", () => {
    describe("Anonymous user", () => {
      test("With incorrect `email` but correct `password`", async () => {
        const user = await orchestrator.createUser({});
        const response = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "wrong@example.com",
            password: user.password,
          }),
        });
        expect(response.status).toBe(401);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 401,
          name: "UnauthorizedError",
          message: "Unauthorized.",
          action: "Check the credentials.",
        });
      });

      test("With correct `email` but incorrect `password`", async () => {
        let user = await orchestrator.createUser({
          email: "correct@example.com",
        });
        const response = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            password: "wrong_password",
          }),
        });
        expect(response.status).toBe(401);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 401,
          name: "UnauthorizedError",
          message: "Unauthorized.",
          action: "Check the credentials.",
        });
      });

      test("With incorrect `email` and `password`", async () => {
        await orchestrator.createUser({});
        const response = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "incorrect@example.com",
            password: "wrong_password",
          }),
        });
        expect(response.status).toBe(401);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 401,
          name: "UnauthorizedError",
          message: "Unauthorized.",
          action: "Check the credentials.",
        });
      });

      test("With correct credentials", async () => {
        let user = await orchestrator.createUser({
          email: "tudo.correto@example.com",
          password: "tudocorreto",
        });
        const response = await fetch(`${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        });
        expect(response.status).toBe(201);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          token: respBody.token,
          expires_at: respBody.expires_at,
          user_id: user.id,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(uuidVersion(respBody.user_id)).toBe(4);
        expect(respBody.created_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.updated_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.expires_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.created_at).toEqual(respBody.updated_at);

        const expiresAt = new Date(respBody.expires_at);
        const createdAt = new Date(respBody.created_at);

        expiresAt.setMilliseconds(0);
        createdAt.setMilliseconds(0);
        expect(expiresAt - createdAt).toEqual(session.SESSION_EXPIRATION_TIME);
      });
    });
  });
});
