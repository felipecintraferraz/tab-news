import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "infra/authentication.js";
import session from "models/session.js";

const router = createRouter();
export default router.handler(controller.errorHandlers);

router.post(async (req, res) => {
  const userInputValues = req.body;
  let authenticatedUser;

  authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  return res.status(201).json(newSession);
});
