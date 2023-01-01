const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const movimientosModel = require("../models/movimientosModel");

module.exports = {
  getAll: async function (req, res, next) {
    const page = req.query.page;
    const perPage = req.query.limit;
    try {
      // busco la cantidad de documentos
      const totalDocuments = await cuentasCorrientesModel
        .find()
        .countDocuments();

      // busco los documentos, limitados
      const documentsFound = await cuentasCorrientesModel
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
  create: async function (req, res, next) {
    const { codigo, ciudad, precioCongelado, precioFresco } = req.body;
    try {
      const document = new cuentasCorrientesModel({
        titular: codigo,
        ciudad: ciudad,
        precioCongelado: precioCongelado,
        precioFresco: precioFresco,
        /*       debe: 0,
        haber: 0, */
        isActive: true,
        /*         balance: 0, */
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    const name = req.params.name;

    try {
      const document = await cuentasCorrientesModel.find({
        titular: name,
      });

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  getById: async function (req, res, next) {
    const id = req.params.id;
    try {
      const document = await cuentasCorrientesModel.find({
        titular_id: id,
      });

      res.json(document[0]);
    } catch (e) {
      next(e);
    }
  },
  agregarAlHaber: async function (req, res, next) {
    const cuentaCorriente_id = req.body.cuentaCorriente_id;
    let monto = parseInt(req.body.monto);

    try {
      const document = await cuentasCorrientesModel.updateOne(
        { _id: cuentaCorriente_id },
        { $inc: { haber: monto } }
      );

      res.json(`Agregados ${monto} al haber.`);
    } catch (e) {
      next(e);
    }
  },
  agregarAlDebe: async function (req, res, next) {
    const cuentaCorriente_id = req.body.cuentaCorriente_id;
    let monto = parseInt(req.body.monto);

    try {
      const document = await cuentasCorrientesModel.updateOne(
        { _id: cuentaCorriente_id },
        { $inc: { debe: monto } }
      );

      res.json(`Agregados ${monto} al debe.`);
    } catch (e) {
      next(e);
    }
  },
  restarDebe: async function (req, res, next) {
    const { codigo, monto } = req.body;

    console.log("restar debe > monto:", monto);
    try {
      const cliente = await cuentasCorrientesModel.findOne({ codigo: codigo });

      const id_cliente = cliente._id;
      const document = await cuentasCorrientesModel.updateOne(
        { titular_id: id_cliente },
        { $inc: { debe: -monto } }
      );
      res.json(`Agregados ${monto} al debe.`);
    } catch (e) {
      next(e);
    }
  },
  modificar: async function (req, res, next) {
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != "")
    );
    console.log(updateData);
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
      console.log(e);
    }
  },
};
