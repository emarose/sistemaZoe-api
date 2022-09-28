const movimientosModel = require("../models/movimientosModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const titularesModel = require("../models/titularesModel");

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
  addNuevoMovimiento: async function (req, res, next) {
    const fecha = new Date(req.body.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const data = new movimientosModel({
        cliente: req.body.cliente,
        planta: req.body.concepto,
        fecha: fecha,
        vehiculo: "-",
        cajas: 0,
        kgCong: 0,
        precioFresco: 0,
        precioCongelado: 0,
        importe: parseFloat(req.body.importe),
        saldo_actual: req.body.saldo_anterior + parseFloat(req.body.importe),
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
    const page = req.query.page || 0;
    const perPage = req.query.limit || 100;

    const fecha = new Date(req.body.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const totalDocuments = await titularesModel.find().countDocuments();

      const documents = await movimientosModel
        .find({
          fecha: fecha,
        })
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      // devuelvo los documentos encontrados y la ultima pagina

      res.json([documents, ultimaPagina]);
    } catch (e) {
      next(e);
    }

    /*  const fecha = new Date(req.body.fecha);
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
    } */
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
      console.log(documents);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = 10;
    try {
      const totalDocuments = await titularesModel.find().countDocuments();

      const documents = await movimientosModel
        .find({
          cliente: req.params.name,
        })
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      let documentLenght = parseInt(Object.values(documents).length);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      // devuelvo los documentos encontrados y la ultima pagina

      res.json([documents, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  },
  deleteMovement: async function (req, res, next) {
    const movementId = req.params.id;
    const titular_id = req.body.data;
    console.log(movementId, titular_id);
    try {
      const movimiento = await movimientosModel.find({ _id: movementId });
      let importe = movimiento[0].importe;

      const document = await cuentasCorrientesModel.updateOne(
        { titular_id: titular_id },
        { $inc: { debe: -importe } }
      );
      console.log(document);
      const deleted = await movimientosModel.deleteOne({ _id: movementId });

      console.log(deleted);

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  editMovement: async function (req, res, next) {
    console.log(req.body, req.params);
    const { cliente, planta, vehiculo, cajas, kgCong, importe } = req.body;

    try {
      const doc = await movimientosModel.findOne({ _id: req.params.id });
      const update = { cliente, planta, vehiculo, cajas, kgCong, importe };
      await doc.updateOne(update);

      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  },
};
