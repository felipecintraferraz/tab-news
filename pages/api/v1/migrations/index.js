import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller.js";
import { createRouter } from "next-connect";

const router = createRouter();
export default router.handler(controller.errorHandlers);

const defaultOptions = {
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

let databaseClient;
let migrations;

router
  .get(async (req, res) => {
    try {
      databaseClient = await database.getNewClient();
      migrations = await migrationRunner({
        ...defaultOptions,
        dbClient: databaseClient,
      });
      return res.status(200).json(migrations);
    } finally {
      await databaseClient?.end();
    }
  })
  .post(async (req, res) => {
    try {
      databaseClient = await database.getNewClient();
      migrations = await migrationRunner({
        ...defaultOptions,
        dbClient: databaseClient,
        dryRun: false,
        verbose: false,
      });
      if (migrations.length > 0) {
        return res.status(201).json(migrations);
      } else {
        return res.status(200).json({ message: "No migrations to apply" });
      }
    } finally {
      await databaseClient?.end();
    }
  });
