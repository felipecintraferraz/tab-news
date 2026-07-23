import email from "infra/email.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.deleteAllEmails();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await email.send({
      from: "TabNews <contato@tab.com>",
      to: "contato@felipeferraz.dev.br",
      subject: "Assunto do email de teste",
      text: "Aqui é o corpo",
    });

    await email.send({
      from: "TabNews <contato@tab.com>",
      to: "contato@felipeferraz.dev.br",
      subject: "Último assunto",
      text: "Aqui é o corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    console.log(lastEmail);
    expect(lastEmail.sender).toBe("<contato@tab.com>");
    expect(lastEmail.recipients[0]).toBe("<contato@felipeferraz.dev.br>");
    expect(lastEmail.subject).toEqual("Último assunto");
    expect(lastEmail.text).toEqual("Aqui é o corpo do último email\r\n");
  });
});
