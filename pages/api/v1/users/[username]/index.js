import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();
export default router.handler(controller.errorHandlers);

router.get(async (req, res) => {
  const foundUser = await user.findOneBy("username", req.query.username);
  return res.status(200).json(foundUser);
});

router.patch(async (req, res) => {
  const username = req.query.username;
  const userInputValues = req.body;
  const updatedUser = await user.update(username, userInputValues);
  res.status(200).json(updatedUser);
});
