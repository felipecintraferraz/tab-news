import waitForAllServices from "tests/orchestrator.js";

const url = "http://localhost:3000/api/v1/status";
let response;
let respBody;

beforeAll(async () => {
  await waitForAllServices();
});

beforeEach(async () => {
  response = await fetch(url, {
    method: "POST",
  });
  respBody = await response.json();
});

test("POST to /status should return status code 405", async () => {
  expect(response.status).toBe(405);
  expect(respBody.message).toBe("Method Not Allowed");
});
