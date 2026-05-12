import database from "infra/database.js"

const url = "http://localhost:3000/api/v1/migrations"
let response
let respBody

beforeAll(async () => {
  await database.cleanDatabase()
})

beforeEach(async () => {
  response = await fetch(url)
  respBody = await response.json()
})

test("GET to /migrations should return status code 200", async () => {
  expect(response.status).toBe(200)
  expect(Array.isArray(respBody)).toBe(true)
  expect(respBody.length).toBeGreaterThan(0)
});


// test("Expect that status message to be 'Todos os serviços estão online'", async () => {
// const resp = await fetch(url)
// const respBody = await resp.json();
// expect(respBody.message).toBe("Todos os serviços estão online");
// });
