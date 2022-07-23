const movimientosModel = require("../models/movimientosModel");
const formatDateString = require("../util/utils");

module.exports = {
  create: async function (req, res, next) {
    console.log(req.body);
    try {
      const data = new movimientosModel({
        cliente: req.body.cliente,
        planta: req.body.planta,
        vehiculo: req.body.vehiculo,
        cajas: req.body.cajas,
        kgCong: req.body.kgCong,
        precioFresco: req.body.precioFresco,
        precioCongelado: req.body.precioCongelado,
        importe: req.body.importe,
        fecha: formatDateString(new Date(req.body.fecha)),
      });
      const document = await data.save();

      res.status(201).json(document);
    } catch (e) {
      console.log(e);
      e.status = 400;
      next(e);
    }
  },
  getAll: async function (req, res, next) {
    try {
      const movs = await movimientosModel.find();
      res.json(movs);
    } catch (e) {
      next(e);
    }
  },
  byDate: async function (req, res, next) {
    /*  const fecha = req.body.fecha; */
    const fecha = formatDateString(new Date(req.params.date));
    try {
      const documents = await movimientosModel.find({ fecha: fecha });
      console.log(documents);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },

  /*  
  getById: async function (req, res, next) {
   
    try {
      const documents = await productsModel.findById(req.params.id);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  
  update: async function (req, res, next) {
    console.log(req.body[0].searchField);

    try {
      const doc = await productsModel.findOne({ _id: req.params.id });
      const update = { [req.body[0].searchField]: req.body[0].update };
      await doc.updateOne(update);

      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  },
  delete: async function (req, res, next) {
    try {
      console.log(req.body);
      const deleted = await productsModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await productsModel.find({}).sort({ code: -1 }).limit(1);

      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
