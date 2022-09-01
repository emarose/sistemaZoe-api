const titularesModel = require("../models/titularesModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");

module.exports = {
  create: async function (req, res, next) {
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
  getAll: async function (req, res, next) {
    const page = req.query.page;
    const perPage = 10;
    try {
      // busco la cantidad de documentos
      const totalDocuments = await titularesModel.find().countDocuments();

      console.log("total Documentos:", totalDocuments);

      // busco los documentos, limitados
      const documentsFound = await titularesModel
        .find()
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      let documentLenght = parseInt(Object.values(documentsFound).length);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      console.log("cantidad de documentos por pagina:", documentLenght);
      console.log("ultima pagina:", ultimaPagina);

      // devuelvo los documentos encontrados y la ultima pagina
      res.json([documentsFound, ultimaPagina]);
    } catch (e) {
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
  /* 
  create: async function (req, res, next) {
    try {
      const document = new customersModel({
        code: req.body.code,
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        notes: req.body.notes === " " ? "Sin observaciones" : req.body.notes,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  delete: async function (req, res, next) {
    try {
      const deleted = await customersModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
  update: async function (req, res, next) {
    try {
      const doc = await customersModel.findOne({ _id: req.params.id });
      const update = { [req.body[0].searchField]: req.body[0].update };
      await doc.updateOne(update);
      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await customersModel.find({}).sort({ code: -1 }).limit(1);

      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
