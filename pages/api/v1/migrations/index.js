import migrationRunner from 'node-pg-migrate'
import { join } from "node:path"
import database from "infra/database.js"

export default async function migrations(req, res) {
  const databaseClient = await database.getNewClient();
  const defaultOptions = {
    dbClient: databaseClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations"
  }
  let migrations
  if (req.method === "GET") {
    migrations = await migrationRunner(defaultOptions)
    await databaseClient.end();
  }
  else if (req.method === "POST") {
    migrations = await migrationRunner({
      ...defaultOptions,
      dryRun: false,
      verbose: false
    })
    await databaseClient.end();
    if (migrations.length > 0) {
      return res.status(201).json(migrations);
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" })
  }
  return res.status(200).json(migrations);
}
