import orchestrator from "tests/orchestrator.js";

const url = "http://localhost:3000/api/v1/migrations";
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

beforeEach(async () => {
  response = await fetch(url);
  respBody = await response.json();
});

describe("API v1", () => {
  describe("GET /migrations", () => {
    describe("Anonymous user", () => {
      test("Run migrations in dry run mode", async () => {
        expect(response.status).toBe(200);
        expect(Array.isArray(respBody)).toBe(true);
        expect(respBody.length).toBeGreaterThan(0);
      });
    });
  });
});
