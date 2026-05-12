const url = "http://localhost:3000/api/v1/migrations"
let response
let respBody

beforeEach(async () => {
  response = await fetch(url, {
    method: "DELETE"
  })
  respBody = await response.json()
})

test("DELETE to /migrations should return status code 405", async () => {
  expect(response.status).toBe(405)
  expect(respBody.message).toBe("Method Not Allowed")
});
