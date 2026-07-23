import orchestrator from "tests/orchestrator";

const route = "/api/v1/users";
const url = `${process.env.BASE_URL}${route}`;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "registration.flow@curso.dev",
        password: "MyStrongPassword",
      }),
    });
    expect(createUserResponse.status).toBe(201);

    const createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toHaveProperty("id");
    expect(createUserResponseBody).toHaveProperty("username");
    expect(createUserResponseBody).toHaveProperty("email");
    expect(createUserResponseBody).toHaveProperty("created_at");
    expect(createUserResponseBody).toHaveProperty("updated_at");
  });

  test("Receive activation email", async () => {});

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
