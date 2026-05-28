import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.createUser({
    username: "John_Doe",
    email: "john_doe@example.com",
    password: "123456",
  });
});

describe("API v1", () => {
  describe("GET /users/[username]", () => {
    describe("Anonymous user", () => {
      test("With exact case match username", async () => {
        const response = await fetch(`${url}/John_Doe`);
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: "John_Doe",
          email: "john_doe@example.com",
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(Date.parse(respBody.created_at)).not.toBeNaN();
        expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      });

      test("With case mismatch username", async () => {
        const response = await fetch(`${url}/john_doe`);
        expect(response.status).toBe(200);
        const respBody = await response.json();
        expect(respBody).toEqual({
          id: respBody.id,
          username: "John_Doe",
          email: "john_doe@example.com",
          created_at: respBody.created_at,
          updated_at: respBody.updated_at,
        });
        expect(uuidVersion(respBody.id)).toBe(4);
        expect(Date.parse(respBody.created_at)).not.toBeNaN();
        expect(Date.parse(respBody.updated_at)).not.toBeNaN();
      });

      test("With nonexistent username", async () => {
        const response = await fetch(`${url}/invalidUser`);
        expect(response.status).toBe(404);
        const respBody = await response.json();
        expect(respBody).toEqual({
          statusCode: 404,
          message: "Username not found",
          action: "Check the username.",
          name: "ResourceNotFoundError",
        });
      });
    });
  });
});
