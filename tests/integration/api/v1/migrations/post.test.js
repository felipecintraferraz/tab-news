import database from "infra/database.js"
import orchestrator from "tests/orchestrator.js"

const url = "http://localhost:3000/api/v1/migrations"
let response
let respBody

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await database.cleanDatabase()
})

beforeEach(async () => {
  response = await fetch(url, {
    method: "POST"
  })
  respBody = await response.json()
})

test("POST to /migrations should return status code 201 and a non empty array", async () => {
  expect(response.status).toBe(201)
  expect(Array.isArray(respBody)).toBe(true)
  expect(respBody.length).toBeGreaterThan(0)
});

test("Second POST to /migrations should return status code 200 and message: 'No migrations to apply'", async () => {
  expect(response.status).toBe(200)
  expect(respBody.message).toBe("No migrations to apply")
  // expect(respBody.length).toBe(0)
});
