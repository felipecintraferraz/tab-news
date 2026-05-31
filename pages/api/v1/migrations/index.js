import controller from "infra/controller.js";
import migrator from "models/migrator";
import { createRouter } from "next-connect";

const router = createRouter();
export default router.handler(controller.errorHandlers);

let migrations;

router
  .get(async (_, res) => {
    migrations = await migrator.listPendingMigrations();
    return res.status(200).json(migrations);
  })
  .post(async (_, res) => {
    migrations = await migrator.runPendingMigrations();
    if (migrations.length > 0) {
      return res.status(201).json(migrations);
    } else {
      return res.status(200).json({ message: "No migrations to apply." });
    }
  });
