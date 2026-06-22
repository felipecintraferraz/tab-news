import crypto from "crypto";
import database from "infra/database.js";

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME);

  const newSession = runInsertQuery(token, userId, expiresAt);

  return newSession;
}

async function runInsertQuery(token, userId, expiresAt) {
  const session = await database.query({
    text: `INSERT INTO
            sessions (token, user_id, expires_at)
          VALUES
            ($1, $2, $3)
          RETURNING
          *;`,
    values: [token, userId, expiresAt],
  });
  return session.rows[0];
}

const session = {
  create,
  SESSION_EXPIRATION_TIME,
};

export default session;
