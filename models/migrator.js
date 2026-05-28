import { join } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database";

const defaultOptions = {
  dryRun: true,
  dir: join(process.cwd(), "infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

let listDbClient;
async function listPendingMigrations() {
  try {
    listDbClient = await database.getNewClient();
    const migrations = await migrationRunner({
      ...defaultOptions,
      dbClient: listDbClient,
    });
    return migrations;
  } finally {
    await listDbClient?.end();
  }
}

async function runPendingMigrations() {
  let migrations;
  let runDbClient;
  try {
    runDbClient = await database.getNewClient();
    migrations = await migrationRunner({
      ...defaultOptions,
      dbClient: runDbClient,
      dryRun: false,
      verbose: false,
    });
  } finally {
    await runDbClient?.end();
  }
  return migrations;
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
