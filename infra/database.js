import { Client } from "pg";

const clientObj = {
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.POSTGRES_SSL
}

async function query(queryObject) {
  const client = new Client(clientObj);

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

export default {
  query: query,
}
