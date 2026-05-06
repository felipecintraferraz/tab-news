const url = "http://localhost:3000/api/v1/status";
test("Expect that status code to be 200", async () => {
  const resp = await fetch(url)
  expect(resp.status).toBe(200);
});

test("Expect that status message to be 'Todos os serviços estão online'", async () => {
  const resp = await fetch(url)
  const data = await resp.json();
  expect(data.message).toBe("Todos os serviços estão online");
});
