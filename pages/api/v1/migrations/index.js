import migrationRunner from 'node-pg-migrate'
import { join } from "node:path"
const defaultOptions = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations"
}
export default async function migrations(req, res) {
  let migrations
  if (req.method === "GET") {
    migrations = await migrationRunner(defaultOptions)
  }
  else if (req.method === "POST") {
    migrations = await migrationRunner({
      ...defaultOptions,
      dryRun: false,
      verbose: false
    })
    if (migrations.length > 0) {
      return res.status(201).json(migrations);
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" })
  }
  return res.status(200).json(migrations);
}
