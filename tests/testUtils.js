export default function checkNotAllowedResponse(respBody) {
  expect(respBody.status).toBe(405);
  expect(respBody).toEqual({
    statusCode: 405,
    name: "MethodNotAllowedError",
    message: "Method not allowed.",
    action: "Use an allowed method.",
  });
}
