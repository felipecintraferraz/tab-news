import crypto from "crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const SESSION_EXPIRATION_TIME_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME_MS);

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

async function findValidSessionByToken(token) {
  const session = await database.query({
    text: `SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`,
    values: [token],
  });
  if (session.rows.length === 0) {
    throw new UnauthorizedError({
      message: "Invalid session token",
      action: "Provide a valid session token.",
    });
  }
  return session.rows[0];
}

async function renew(sessionId) {
  const newExpiresAt = new Date(Date.now() + SESSION_EXPIRATION_TIME_MS);
  const updatedSession = await database.query({
    text: `UPDATE sessions SET expires_at = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
    values: [newExpiresAt, sessionId],
  });
  return updatedSession.rows[0];
}

async function expire(sessionId) {
  const expiredSession = await database.query({
    text: `UPDATE sessions SET expires_at = expires_at - interval '1 year', updated_at = NOW() WHERE id = $1 RETURNING *;`,
    values: [sessionId],
  });
  return expiredSession.rows[0];
}

const session = {
  create,
  findValidSessionByToken,
  renew,
  expire,
  SESSION_EXPIRATION_TIME_MS,
};

export default session;
