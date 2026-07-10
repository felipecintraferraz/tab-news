import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();
export default router.handler(controller.errorHandlers);

router.get(async (req, res) => {
  const sessionToken = req.cookies.session_id;

  const sessionObject = await session.findValidSessionByToken(sessionToken);
  const authenticatedUser = await user.findOneBy("id", sessionObject.user_id);
  await session.renew(sessionObject.id);
  await controller.setSessionCookie(sessionObject.token, res);

  return res.status(200).json(authenticatedUser);
});
