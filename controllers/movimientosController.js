const movimientosModel = require("../models/movimientosModel");
const formatDateString = require("../util/utils");
const moment = require("moment");

module.exports = {
  create: async function (req, res, next) {
    const fecha = new Date(req.body.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

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
        fecha: fecha,
        saldo_actual: req.body.saldo_anterior + req.body.importe,
        saldo_anterior: req.body.saldo_anterior,
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
    const fecha = new Date(req.body.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const documents = await movimientosModel.find({
        fecha: fecha,
      });
      console.log(documents);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  betweenDates: async function (req, res, next) {
    const { initDate, endDate, codigo } = req.body.data;

    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(4);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    try {
      const documents = await movimientosModel.find({
        fecha: {
          $gte: fechaInicio,
          $lte: fechaFin,
        },
        cliente: codigo,
      });

      console.log(documents);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  betweenDatesAll: async function (req, res, next) {
    const { initDate, endDate } = req.body.data;
    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const fechaFin = new Date(endDate);
    fechaFin.setHours(4);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    try {
      const documents = await movimientosModel.find({
        fecha: {
          $gte: fechaInicio,
          $lte: fechaFin,
        },
      });

      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    try {
      const documents = await movimientosModel.find({
        cliente: req.params.name,
      });
      res.json(documents);

      /*  console.log(documents); */
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
