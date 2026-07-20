import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

const route = "/api/v1/session";
const url = `${process.env.BASE_URL}${route}`;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("API v1", () => {
  describe("DELETE /sessions", () => {
    describe("Default user", () => {
      test("With nonexistent session", async () => {
        const fakeToken =
          "523e9d446e806d9861425bcc53d95a6df273c5cc6ea096e50d5d96a5de229924e098862a09a4ce475e2ffed3d0f39d3c";

        const resp = await fetch(url, {
          method: "DELETE",
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
        const createdUser = await orchestrator.createUser({});
        const sessionObject = await orchestrator.createSession(createdUser.id);
        jest.useRealTimers();

        const resp = await fetch(url, {
          method: "DELETE",
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

      test("With valid session", async () => {
        const createdUser = await orchestrator.createUser({});
        const sessionObject = await orchestrator.createSession(createdUser.id);
        const resp = await fetch(url, {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(resp.status).toBe(200);
        const respBody = await resp.json();
        expect(respBody).toEqual({
          id: sessionObject.id,
          token: sessionObject.token,
          user_id: sessionObject.user_id,
          expires_at: respBody.expires_at,
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(new Date(respBody.expires_at).getTime()).toBeLessThan(
          sessionObject.expires_at.getTime(),
        );
        expect(new Date(respBody.updated_at).getTime()).toBeGreaterThan(
          sessionObject.updated_at.getTime(),
        );

        const parsedCookies = setCookieParser(resp, {
          map: true,
        });

        expect(parsedCookies.session_id).toEqual({
          name: "session_id",
          value: "invalid",
          httpOnly: true,
          path: "/",
          maxAge: -1,
        });

        const doubleCheck = await fetch(`${process.env.BASE_URL}/api/v1/user`, {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(doubleCheck.status).toBe(401);
        const doubleCheckBody = await doubleCheck.json();
        expect(doubleCheckBody).toEqual({
          message: "Invalid session token",
          action: "Provide a valid session token.",
          name: "UnauthorizedError",
          statusCode: 401,
        });
      });
    });
  });
});
