import orchestrator from "tests/orchestrator.js";

const route = "/api/v1/migrations";
const url = `${process.env.BASE_URL}${route}`;
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  response = await fetch(url, {
    method: "PUT",
  });
  respBody = await response.json();
});

describe("API v1", () => {
  describe("PUT /migrations", () => {
    describe("Anonymous user", () => {
      test("Is not allowed", async () => {
        expect(response.status).toBe(405);
        expect(respBody.message).toBe("Method not allowed.");
      });
    });
  });
});
