const hojasRutaModel = require("../models/hojasRutaModel");
const movimientosModel = require("../models/movimientosModel");
const { formatDateString } = require("../util/utils");
const { formatNumberToCurrency } = require("../util/utils");

var path = require("path");

const pdf = require("pdf-creator-node");
var fs = require("fs");

module.exports = {
  getAll: async function (req, res, next) {
    try {
      const document = await hojasRutaModel.find();

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  create: async function (req, res, next) {
    const fecha = new Date(req.body.fecha);

    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const document = new hojasRutaModel({
        movimientos: req.body.movimientos,
        fecha: fecha,
        importeTotal: req.body.importeTotal,
        cajasTotal: req.body.cajasTotal,
        kgTotal: req.body.kgTotal,
      });

      console.log(document);

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      res.status(555);
      res.send("hoja duplicada");
    }
  },
  getByDate: async function (req, res, next) {
    const date = new Date(req.params.date);
    date.setHours(4);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    try {
      const document = await hojasRutaModel.find({
        fecha: date,
      });

      res.json(document[0]);
    } catch (e) {
      next(e);
    }
  },
  betweenDates: async function (req, res, next) {
    const { initDate, endDate } = req.query;
    console.log(req.query);

    const fechaInicio = new Date(initDate);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    console.log(fechaInicio);
    const fechaFin = new Date(endDate);
    fechaFin.setHours(4);
    fechaFin.setMinutes(0);
    fechaFin.setMilliseconds(0);
    fechaFin.setSeconds(0);

    try {
      const documents = await hojasRutaModel.find({
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
  modificar: async function (req, res, next) {
    const { fecha, movimientos, importeTotal, cajasTotal, kgTotal } = req.body;
    console.log(cajasTotal);
    try {
      const update = await hojasRutaModel.updateOne(
        { id: req.params.id },
        {
          $set: {
            importeTotal: importeTotal,
            movimientos: movimientos,
            cajasTotal: cajasTotal,
            kgTotal: kgTotal,
          },
        },
        { multi: true }
      );

      console.log(update);
      res.json(update);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  eliminar: async function (req, res, next) {
    const fecha = new Date(req.params.date);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);
    console.log(fecha);
    try {
      const deleted = await hojasRutaModel.deleteOne({ fecha: fecha });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
};
