import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function findOneBy(username) {
  const results = await database.query({
    text: `SELECT id, username, email, created_at, updated_at FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
    values: [username],
  });
  if (results.rowCount > 0) return results.rows[0];
  throw new NotFoundError({
    message: "Username not found",
    action: "Check the username.",
  });
}

async function runInsertQuery(userInputValues) {
  const result = await database.query({
    text: `INSERT INTO users (username, email, password)
           VALUES ($1, $2, $3)
           RETURNING id, username, email, created_at, updated_at;`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });
  return result.rows[0];
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER($1);`,
    values: [email],
  });
  if (result.rows[0].count > 0) {
    throw new ValidationError({
      message: "Email already in use",
      action: "Use a different email",
    });
  }
  return true;
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER($1);`,
    values: [username],
  });
  if (result.rows[0].count > 0) {
    throw new ValidationError({
      message: "Username already in use",
      action: "Use a different username",
    });
  }
  return true;
}

const user = {
  create,
  findOneBy,
};

export default user;
