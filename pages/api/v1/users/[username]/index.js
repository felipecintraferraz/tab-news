import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();
export default router.handler(controller.errorHandlers);

router.get(async (req, res) => {
  const foundUser = await user.findOneBy(req.query.username);
  return res.status(200).json(foundUser);
});
