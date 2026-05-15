import database from "infra/database.js";
import waitForAllServices from "tests/orchestrator.js";

const url = "http://localhost:3000/api/v1/migrations";
let response;
let respBody;

beforeAll(async () => {
  await waitForAllServices();
  await database.cleanDatabase();
});

beforeEach(async () => {
  response = await fetch(url);
  respBody = await response.json();
});

test("GET to /migrations should return status code 200", async () => {
  expect(response.status).toBe(200);
  expect(Array.isArray(respBody)).toBe(true);
  expect(respBody.length).toBeGreaterThan(0);
});
