import { createRouter } from "next-connect";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

let dbName;
const router = createRouter();

router.get(async (req, res) => {
  dbName = process.env.POSTGRES_DB;
  const usedConnectionsQuery =
    "SELECT count(*)::int as used_connections FROM pg_stat_activity WHERE datname = $1;";
  const versionResponse = await database.query("SHOW server_version;");
  const maxConnectionsResponse = await database.query("SHOW max_connections;");
  const usedConnectionsResponse = await database.query({
    text: usedConnectionsQuery,
    values: [dbName],
  });

  return res.status(200).json({
    updated_at: new Date().toISOString(),
    dependencies: {
      database: {
        version: versionResponse.rows[0].server_version,
        max_connections: maxConnectionsResponse.rows[0].max_connections,
        opened_connections: usedConnectionsResponse.rows[0].used_connections,
      },
    },
  });
});

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
  res.status(publicError.statusCode).json(publicError);
}
