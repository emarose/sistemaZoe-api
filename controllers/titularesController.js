const titularesModel = require("../models/titularesModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");

module.exports = {
  /*   create: async function (req, res, next) {
    try {
      const document = new titularesModel({
        saldo: 0,
        codigo: req.body.codigo,
        ciudad: req.body.ciudad,
        precioCongelado: req.body.precioCongelado,
        precioFresco: req.body.precioFresco,
      });

      const response = await document.save();

      const doc = new cuentasCorrientesModel({
        titular_id: response._id,
        debe: 0,
        haber: 0,
        isActive: true,
      });

      const save = await doc.save();

      res.json(save);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    try {
      const document = await titularesModel.find({ codigo: req.params.name });
      res.json(document[0]);
    } catch (e) {
      next(e);
    }
  },
  getAll: async function (req, res, next) {
    const page = req.query.page;
    const perPage = req.query.limit;

    try {
      // busco la cantidad de documentos
      const totalDocuments = await titularesModel.find().countDocuments();

      // busco los documentos, limitados
      const documentsFound = await titularesModel
        .find()
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      // devuelvo los documentos encontrados y la ultima pagina
      res.json([documentsFound, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  },
  modificar: async function (req, res, next) {
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != "")
    );

    try {
      console.log(updateData);

      const doc = await titularesModel.findOneAndUpdate(
        { _id: req.query.titularId },
        updateData,
        {
          new: true,
        }
      );

      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  }, */
};
