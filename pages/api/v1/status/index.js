function status(req, res) {
  res.status(200).json({
    message: "Todos os serviços estão online"
  });
}

export default status;
