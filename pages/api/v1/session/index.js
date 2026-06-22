import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import authentication from "infra/authentication.js";
import session from "models/session.js";
import * as cookie from "cookie";

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

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.SESSION_EXPIRATION_TIME / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.setHeader("Set-Cookie", setCookie);

  return res.status(201).json(newSession);
});
