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
    method: "DELETE",
  });
  respBody = await response.json();
});

describe("API v1", () => {
  describe("DELETE /migrations", () => {
    describe("Anonymous user", () => {
      test("Is not allowed", async () => {
        expect(response.status).toBe(405);
        expect(respBody.message).toBe("Method Not Allowed");
      });
    });
  });
});
