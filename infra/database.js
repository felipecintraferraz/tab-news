import { Client } from "pg";



async function query(queryObject) {
  let client

  try {
    client = await getNewClient();
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

async function getNewClient(){
  var useSSL = process.env.NODE_ENV === "production" ? true : false;
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: useSSL
  });
  await client.connect();
  return client;
}

export default {
  query,
  cleanDatabase,
  getNewClient,
}
