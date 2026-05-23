import orchestrator from "tests/orchestrator.js";

const route = "/api/v1/migrations";
const url = `${process.env.BASE_URL}${route}`;
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

beforeEach(async () => {
  response = await fetch(url, {
    method: "POST",
  });
  respBody = await response.json();
});
describe("API v1", () => {
  describe("POST /migrations", () => {
    describe("Anonymous user", () => {
      test("Run migrations when pending migrations exists", async () => {
        expect(response.status).toBe(201);
        expect(Array.isArray(respBody)).toBe(true);
        expect(respBody.length).toBeGreaterThan(0);
      });

      test("Run migrations when no pending migrations exist", async () => {
        expect(response.status).toBe(200);
        expect(respBody.message).toBe("No migrations to apply.");
      });
    });
  });
});
