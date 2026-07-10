import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

const route = "/api/v1/user";
const url = `${process.env.BASE_URL}${route}`;
const ISO8601_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("API v1", () => {
  describe("GET /user", () => {
    describe("Default user", () => {
      test("With valid session", async () => {
        const createdUser = await orchestrator.createUser({
          username: "UserWithSession",
        });
        jest.useFakeTimers({
          now: new Date(Date.now() - session.SESSION_EXPIRATION_TIME_MS / 2),
        });
        const sessionObject = await orchestrator.createSession(createdUser.id);
        jest.useRealTimers();
        const resp = await fetch(url, {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(resp.status).toBe(200);
        const respBody = await resp.json();
        expect(respBody).toEqual({
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          created_at: createdUser.created_at.toISOString(),
          updated_at: createdUser.updated_at.toISOString(),
        });

        expect(respBody).not.toHaveProperty("password");
        expect(respBody).not.toHaveProperty("password_hash");
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(respBody.created_at).toMatch(ISO8601_UTC_REGEX);
        expect(respBody.updated_at).toMatch(ISO8601_UTC_REGEX);

        const renewedSessionObject = await session.findValidSessionByToken(
          sessionObject.token,
        );

        expect(
          new Date(renewedSessionObject.expires_at).getTime(),
        ).toBeGreaterThan(new Date(sessionObject.expires_at).getTime());
        expect(
          new Date(renewedSessionObject.updated_at).getTime(),
        ).toBeGreaterThan(new Date(sessionObject.updated_at).getTime());

        const parsedCookies = setCookieParser(resp, {
          map: true,
        });

        expect(parsedCookies.session_id).toEqual({
          name: "session_id",
          value: sessionObject.token,
          httpOnly: true,
          path: "/",
          maxAge: session.SESSION_EXPIRATION_TIME_MS / 1000,
        });
      });

      test("With nonexistent session", async () => {
        const fakeToken =
          "523e9d446e806d9861425bcc53d95a6df273c5cc6ea096e50d5d96a5de229924e098862a09a4ce475e2ffed3d0f39d3c";

        const resp = await fetch(url, {
          headers: {
            Cookie: `session_id=${fakeToken}`,
          },
        });
        expect(resp.status).toBe(401);
        const respBody = await resp.json();
        expect(respBody).toEqual({
          message: "Invalid session token",
          action: "Provide a valid session token.",
          name: "UnauthorizedError",
          statusCode: 401,
        });
      });

      test("With expired session", async () => {
        jest.useFakeTimers({
          now: new Date(Date.now() - session.SESSION_EXPIRATION_TIME_MS),
        });
        const createdUser = await orchestrator.createUser({
          username: "UserSessionExpired",
        });
        const sessionObject = await orchestrator.createSession(createdUser.id);
        jest.useRealTimers();

        const resp = await fetch(url, {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(resp.status).toBe(401);
        const respBody = await resp.json();
        expect(respBody).toEqual({
          message: "Invalid session token",
          action: "Provide a valid session token.",
          name: "UnauthorizedError",
          statusCode: 401,
        });
      });
    });
  });
});
