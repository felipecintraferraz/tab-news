import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

beforeEach(async () => {
  response = await fetch(url, {
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
  respBody = await response.json();
});
describe("API v1", () => {
  describe("POST /users", () => {
    describe("Anonymous user", () => {
      test("With unique and valid data", async () => {
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
    });
  });
});
