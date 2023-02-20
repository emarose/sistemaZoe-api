const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "secretKey";
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;

module.exports = {
  login: async function (req, res, next) {
    const { username, password } = req.body;

    if (USER === username && PASSWORD === password) {
      const token = jwt.sign({ userId: "user-id" }, secretKey, {
        expiresIn: "3h",
      });
      return res.json({ token });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  },
  getAll: async function (req, res, next) {
    const page = req.query.page;
    const perPage = req.query.limit;
    const skip = page * perPage;
    try {
      /* Query para encontrar todas las Cuentas Corrientes */
      const documents = await cuentasCorrientesModel
        .find()
        .limit(perPage)
        .skip(skip);

      /* Paginacion */
      const totalDocuments = await cuentasCorrientesModel
        .find()
        .countDocuments();
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  },
};
