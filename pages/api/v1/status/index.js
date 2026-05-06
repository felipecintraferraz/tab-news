import database from "infra/database.js";

async function status(req, res) {
  const q = await database.query("SELECT 1");
  res.status(200).json({
    message: "Todos os serviços estão online"
  });
}

export default status;
