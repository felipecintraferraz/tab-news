import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";
import { createRouter } from "next-connect";

const router = createRouter();
export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onErrorHandler(error, req, res) {
  const publicError = new InternalServerError({
    cause: error,
  });
  console.error(publicError);
  res.status(publicError.statusCode).json(publicError);
}

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json({
    message: publicError.message,
  });
}

const defaultOptions = {
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

let databaseClient;
let migrations;

router.get(async (req, res) => {
  try {
    databaseClient = await database.getNewClient();
    migrations = await migrationRunner({
      ...defaultOptions,
      dbClient: databaseClient,
    });
    return res.status(200).json(migrations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    await databaseClient.end();
  }
});

router.post(async (req, res) => {
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
  } catch (error) {
    const publicError = new InternalServerError({
      cause: error,
    });
    throw publicError;
  } finally {
    await databaseClient?.end();
  }
});
