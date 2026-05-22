import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { MethodNotAllowedError } from "infra/errors";

export default async function migrations(req, res) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(req.method)) {
    const publicError = new MethodNotAllowedError();
    return res
      .status(publicError.statusCode)
      .json({ message: publicError.message });
  }
  let databaseClient;
  const defaultOptions = {
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  let migrations;
  try {
    databaseClient = await database.getNewClient();
    if (req.method === "GET") {
      migrations = await migrationRunner({
        ...defaultOptions,
        dbClient: databaseClient,
      });
      return res.status(200).json(migrations);
    } else if (req.method === "POST") {
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
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    await databaseClient.end();
  }
}
