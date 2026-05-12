import database from "infra/database.js"

const url = "http://localhost:3000/api/v1/migrations"
let response
let respBody

beforeAll(async () => {
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

test("Second POST to /migrations should return an empty array", async () => {
  expect(Array.isArray(respBody)).toBe(true)
  expect(respBody.length).toBe(0)
});
