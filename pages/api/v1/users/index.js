import controller from "infra/controller.js";
import { createRouter } from "next-connect";
import user from "models/user.js";

const router = createRouter();
export default router.handler(controller.errorHandlers);

router.post(async (req, res) => {
  const create = await user.create(req.body);
  return res.status(201).json(create);
});
