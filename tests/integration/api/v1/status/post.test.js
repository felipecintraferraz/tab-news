import orchestrator from "tests/orchestrator.js";

const url = "http://localhost:3000/api/v1/status";
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  response = await fetch(url, {
    method: "POST",
  });
  respBody = await response.json();
});

describe("API v1", () => {
  describe("POST /status", () => {
    describe("Anonymous user", () => {
      test("Is not allowed", async () => {
        expect(response.status).toBe(405);
        expect(respBody.message).toBe("Method Not Allowed");
      });
    });
  });
});
