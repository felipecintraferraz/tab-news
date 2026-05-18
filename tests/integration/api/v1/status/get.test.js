import orchestrator from "tests/orchestrator.js";

const url = "http://localhost:3000/api/v1/status";
let response;
let respBody;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(async () => {
  response = await fetch(url);
  respBody = await response.json();
});

describe("API v1", () => {
  describe("GET /status", () => {
    describe("Anonymous user", () => {
      test("Hit the endpoint", async () => {
        expect(response.status).toBe(200);
      });

      test("Validate the update_at timestamp format", async () => {
        const ISO8601_UTC_REGEX =
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
        expect(respBody.updated_at).toMatch(ISO8601_UTC_REGEX);
      });

      test("Validate the database version", async () => {
        expect(respBody.dependencies.database.version).toBeDefined();
        expect(respBody.dependencies.database.version).toEqual("16.0");
      });

      test("Validate the max_connections defined", async () => {
        expect(respBody.dependencies.database.max_connections).toBeDefined();
        const MUST_BE_NUMBER_REGEX = /^\d+$/;
        expect(respBody.dependencies.database.max_connections).toMatch(
          MUST_BE_NUMBER_REGEX,
        );
      });

      test("Validate all but 1 connections are closed", async () => {
        expect(respBody.dependencies.database.opened_connections).toBeDefined();
        expect(respBody.dependencies.database.opened_connections).toEqual(1);
      });
    });
  });
});
