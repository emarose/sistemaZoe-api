const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");

module.exports = {
  create: async function (req, res, next) {
    const { titular, ciudad, precioCongelado, precioFresco } = req.body;
    console.log(req.body);
    try {
      const document = new cuentasCorrientesModel({
        titular: titular,
        ciudad: ciudad,
        precioCongelado: precioCongelado,
        precioFresco: precioFresco,
        isActive: true,
      });
      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      next(e);
    }
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
  getByName: async function (req, res, next) {
    const name = req.params.name;

    try {
      /* Query para encontrar Cuenta Corriente por nombre de titular */
      const document = await cuentasCorrientesModel.find({
        titular: name,
      });

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  update: async function (req, res, next) {
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != "")
    );

    try {
      const doc = await cuentasCorrientesModel.findOneAndUpdate(
        { _id: req.query.id },
        updateData,
        {
          new: true,
        }
      );

      res.json(doc);
    } catch (e) {
      res.status(500).send(e);
      console.log(e);
    }
  },
};
