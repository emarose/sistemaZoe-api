const hojasRutaModel = require("../models/hojasRutaModel");

const { startOfDay, endOfDay } = require("date-fns");

module.exports = {
  create: async function (req, res, next) {
    const { movimientos, importeTotal, cajasTotal, kgTotal } = req.body;
    const fecha = new Date(req.body.fecha);

    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const document = new hojasRutaModel({
        movimientos: movimientos,
        fecha: fecha,
        importeTotal: importeTotal,
        cajasTotal: cajasTotal,
        kgTotal: kgTotal,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      res.status(555).json("hoja duplicada");
      next(e);
    }
  },
  getAll: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 50;
    const skip = page * perPage;

    try {
      /* Query para encontrar todas las hojas de ruta */
      const documents = await hojasRutaModel
        .find({
          isDeleted: false,
        })
        .limit(perPage)
        .skip(skip);

      /* Paginacion */
      const totalDocuments = await hojasRutaModel
        .find({ isDeleted: false })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  getByDate: async function (req, res, next) {
    const date = new Date(req.params.date);
    date.setHours(4);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    try {
      /* Query para encontrar hoja de ruta por fecha */
      const document = await hojasRutaModel.find({
        fecha: date,
        isDeleted: false,
      });

      res.json(document[0]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  betweenDates: async function (req, res, next) {
    const { initDate, endDate } = req.query;

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
      /* Query para encontrar hojas de ruta entre fechas */
      const documents = await hojasRutaModel.find({
        fecha: {
          $gte: startOfDay(fechaInicio),
          $lte: endOfDay(fechaFin),
        },
        isDeleted: false,
      });

      res.json(documents);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  modificar: async function (req, res, next) {
    const { movimientos, importeTotal, cajasTotal, kgTotal } = req.body;

    try {
      const update = await hojasRutaModel.updateOne(
        { id: req.params.id },
        {
          $set: {
            movimientos: movimientos,
            importeTotal: importeTotal,
            cajasTotal: cajasTotal,
            kgTotal: kgTotal,
          },
        },
        { multi: true }
      );

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

    try {
      /* Query para marcar el documento como eliminado (IsDeleted:true) */
      const document = await movimientosModel.updateOne(
        { fecha: fecha },
        { $set: { isDeleted: true } }
      );

      res.json(document);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
};
