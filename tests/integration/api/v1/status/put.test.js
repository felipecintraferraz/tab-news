const url = "http://localhost:3000/api/v1/status"
let response
let respBody

beforeEach(async () => {
  response = await fetch(url, {
    method: "PUT"
  })
  respBody = await response.json()
})

test("PUT to /status should return status code 405", async () => {
  expect(response.status).toBe(405)
  expect(respBody.message).toBe("Method Not Allowed")
});
