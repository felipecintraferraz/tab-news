import { Client } from "pg";

async function query(queryObject) {
  var useSSL = process.env.NODE_ENV === "production" ? true : false;
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: useSSL
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Error querying database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function cleanDatabase() {
  await query("DROP schema public cascade; create schema public;")
}

export default {
  query: query,
  cleanDatabase: cleanDatabase,
}
