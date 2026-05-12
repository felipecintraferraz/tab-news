import migrationRunner from 'node-pg-migrate'
import { join } from "node:path"
import database from "infra/database.js"

export default async function migrations(req, res) {
  let databaseClient
  const defaultOptions = {
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations"
  }
  let migrations
  if (req.method === "GET") {
    databaseClient = await database.getNewClient()
    migrations = await migrationRunner({
      ...defaultOptions,
      dbClient: databaseClient
    })
    await databaseClient.end();
    return res.status(200).json(migrations);
  }
  else if (req.method === "POST") {
    databaseClient = await database.getNewClient();
    migrations = await migrationRunner({
      ...defaultOptions,
      dbClient: databaseClient,
      dryRun: false,
      verbose: false
    })
    await databaseClient.end();
    if (migrations.length > 0) {
      return res.status(201).json(migrations);
    }
    else {
      return res.status(200).json({ message: "No migrations to apply" })
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" })
  }
}
