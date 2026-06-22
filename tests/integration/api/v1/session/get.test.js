import orchestrator from "tests/orchestrator.js";
import checkNotAllowedResponse from "tests/testUtils.js";

const route = "/api/v1/session";
const url = `${process.env.BASE_URL}${route}`;
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  response = await fetch(url, {
    method: "GET",
  });
  respBody = await response.json();
});

describe("API v1", () => {
  describe("GET /sessions", () => {
    describe("Anonymous user", () => {
      test("Is not allowed", async () => {
        expect(response.status).toBe(405);
        checkNotAllowedResponse(respBody);
      });
    });
  });
});
