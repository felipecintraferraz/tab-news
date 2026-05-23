export default function checkNotAllowedResponse(response) {
  expect(response).toEqual({
    statusCode: 405,
    name: "MethodNotAllowedError",
    message: "Method not allowed.",
    action: "Use an allowed method.",
  });
}
