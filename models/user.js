import database from "infra/database.js";
import passwordUtil from "infra/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

const returnUserFields = "id, username, email, created_at, updated_at";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  await hashPasswordInObject(userInputValues);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;
}

async function update(username, userInputValues) {
  const userToUpdate = await findOneBy("username", username);
  if (userInputValues.id) {
    if (userInputValues.id !== userToUpdate.id) {
      throw new ValidationError({
        message: "ID cannot be changed",
        action:
          "Do not provide an ID or provide the same ID as the user to update",
      });
    }
  }
  if (userInputValues.email) {
    await validateUniqueEmail(userInputValues.email);
    userToUpdate.email = userInputValues.email;
  }
  if (userInputValues.username) {
    await validateUniqueUsername(userInputValues.username);
    userToUpdate.username = userInputValues.username;
  }
  if (userInputValues.password) {
    userInputValues = await hashPasswordInObject(userInputValues);
    userToUpdate.password = userInputValues.password;
  }
  const updatedUser = await runUpdateQuery(userToUpdate);
  return updatedUser;
}

async function findOneBy(property, value) {
  const allowedProperties = ["username", "email"];
  if (!allowedProperties.includes(property)) {
    throw new ValidationError({
      message: "Invalid property",
      action: "Use a valid property.",
    });
  }
  const results = await database.query({
    text: `SELECT id, username, email, password, created_at, updated_at FROM users WHERE LOWER(${property}) = LOWER($1) LIMIT 1;`,
    values: [value],
  });
  if (results.rowCount > 0) return results.rows[0];
  throw new NotFoundError({
    message: "User not found",
    action: "Check the provided property and value.",
  });
}

async function getPasswordHashById(id) {
  const results = await database.query({
    text: `SELECT password FROM users WHERE id = $1 LIMIT 1;`,
    values: [id],
  });
  if (results.rowCount > 0) return results.rows[0].password;
  throw new NotFoundError({
    message: "User not found",
    action: "Check the user ID.",
  });
}

async function runInsertQuery(userInputValues) {
  const result = await database.query({
    text: `INSERT INTO users (username, email, password)
           VALUES ($1, $2, $3)
           RETURNING ${returnUserFields};`,
    values: [
      userInputValues.username,
      userInputValues.email,
      userInputValues.password,
    ],
  });
  return result.rows[0];
}

async function runUpdateQuery(updatedUser) {
  let result;
  if (updatedUser.password) {
    result = await database.query({
      text: `UPDATE users SET username = $1, email = $2, password = $3, updated_at = timezone('utc', now()) WHERE id = $4   RETURNING ${returnUserFields};`,
      values: [
        updatedUser.username,
        updatedUser.email,
        updatedUser.password,
        updatedUser.id,
      ],
    });
  } else {
    result = await database.query({
      text: `UPDATE users SET username = $1, email = $2, updated_at = timezone('utc', now()) WHERE id = $3   RETURNING ${returnUserFields};`,
      values: [updatedUser.username, updatedUser.email, updatedUser.id],
    });
  }
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

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await passwordUtil.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
  return userInputValues;
}

const user = {
  create,
  update,
  findOneBy,
  getPasswordHashById,
};

export default user;
