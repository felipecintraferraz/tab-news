import database from "infra/database.js";

async function create(userInputValues) {
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

const user = {
  create,
};

export default user;
