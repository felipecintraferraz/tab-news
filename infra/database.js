import { Client } from "pg";

async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });
  
  await client.connect();
  const result = await client.query(queryObject);
  console.log("DEBUG DATABASE result:", result);
  await client.end();
  return result;
}

export default {
  query: query,
}
