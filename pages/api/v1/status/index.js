import database from "infra/database.js";

let dbName;


async function status(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }
  dbName = process.env.POSTGRES_DB
  const usedConnectionsQuery =
    "SELECT count(*)::int as used_connections FROM pg_stat_activity WHERE datname = $1;"
  const versionResponse = await database.query("SHOW server_version;")
  const maxConnectionsResponse = await database.query("SHOW max_connections;")
  const usedConnectionsResponse = await database.query({
    text: usedConnectionsQuery,
    values: [dbName]
  })

  return res.status(200).json({
    updated_at: new Date().toISOString(),
    dependencies: {
      database: {
        version: versionResponse.rows[0].server_version,
        max_connections: maxConnectionsResponse.rows[0].max_connections,
        opened_connections: usedConnectionsResponse.rows[0].used_connections
      }
    }
  });
}

export default status;
