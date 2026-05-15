import orchestrator from "tests/orchestrator.js"

const url = "http://localhost:3000/api/v1/status"
let response
let respBody

beforeAll(async () => {
  await orchestrator.waitForAllServices()
})

beforeEach(async () => {
  response = await fetch(url)
  respBody = await response.json()
})

test("GET to /status should return status code 200", async () => {
  expect(response.status).toBe(200)
});

test("GET to /status should return updated_at as ISO8601 format", async () => {
  expect(respBody.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
});

test("GET to /status should return database version", async () => {
  expect(respBody.dependencies.database.version).toBeDefined()
  expect(respBody.dependencies.database.version).toEqual("16.0")
})

test("GET to /status should return max_connections", async () => {
  expect(respBody.dependencies.database.max_connections).toBeDefined()
  expect(respBody.dependencies.database.max_connections).toMatch(/^\d+$/)
})

test("GET to /status should return used_connections", async () => {
  expect(respBody.dependencies.database.opened_connections).toBeDefined()
  expect(respBody.dependencies.database.opened_connections).toEqual(1)
})


// test("Expect that status message to be 'Todos os serviços estão online'", async () => {
// const resp = await fetch(url)
// const respBody = await resp.json();
// expect(respBody.message).toBe("Todos os serviços estão online");
// });
