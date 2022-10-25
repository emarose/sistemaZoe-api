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
  createPdf: async function (req, res, next) {
    const fecha = new Date(req.body.data);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    const hojaSeleccionada = await hojasRutaModel.find({
      fecha: fecha,
    });

    const movimientosDeHoja = await movimientosModel.find({
      _id: {
        $in: hojaSeleccionada[0].movimientos,
      },
    });

    /* console.log(movimientosDeHoja); */

    pdf
      .create(pdfTemplate(movimientosDeHoja), {})
      .toFile("./Exported/hojaDeRuta.pdf", (err) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        if (err) {
          res.send(Promise.reject());
        }
        res.send(Promise.resolve());
      });
  },
  getPdf: async function (req, res, next) {
    const date = new Date(req.params.date);
    date.setHours(4);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    try {
      const hojaDeRuta = await hojasRutaModel.find({
        fecha: date,
      });

      const arrayMovimientos = await movimientosModel.find({
        _id: {
          $in: hojaDeRuta[0].movimientos,
        },
      });

      var options = {
        format: "A4",

        border: "10mm",
        /*  header: {
          height: "20mm",
          contents: `<div style="text-align: center; background-color:lightgray;">Hoja De Ruta - ${formatDateString(
            date
          )}</div>`,
        }, */
        /* footer: {
          height: "28mm",
          contents: {
            first: "Pag. 1",
            2: "Pag. 2", // Any page number is working. 1-based index
            default:
              '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
            last: "Última Pag.",
          }, 
        },*/
      };
      /*  for (let i = 0; i < arrayMovimientos.length; i++) {
      
        arrayMovimientos[i].fecha = fecha;
        console.log(arrayMovimientos[i].fecha);
      }
 */
      const hoja = hojaDeRuta.map((object) => {
        let fecha = formatDateString(object.fecha);

        return { ...object, fecha: fecha };
      });

      const movs = [];

      const movimientos = arrayMovimientos.map((object) => {
        let fecha = formatDateString(object.fecha);
        Object.assign;
        (object.fecha = fecha),
          (object.cliente = object.cliente.toUpperCase()),
          (object.planta = object.planta.toUpperCase()),
          (object.vehiculo = object.vehiculo),
          (object.cajas = object.cajas !== 0 ? object.cajas : "-"),
          (object.kgCong = object.kgCong !== 0 ? object.kgCong + "Kg" : "-"),
          (object.importe = formatNumberToCurrency(object.importe));
        /* return movs.push({
          fecha: fecha,
          cliente: object.cliente.toUpperCase(),
          planta: object.planta.toUpperCase(),
          vehiculo: object.vehiculo,
          cajas: object.cajas !== 0 ? object.cajas : "-",
          kgCong: object.kgCong !== 0 ? object.kgCong + "Kg" : "-",
          importe: formatNumberToCurrency(object.importe),
        }); */
      });
      console.log(movimientos);

      var document = {
        html: html,
        data: {
          movimientos: movs,
          hojaDeRuta: hoja,
        },
        path: `./documents/hojaDeRuta.pdf`,
        type: "",
      };

      pdf
        .create(document, options)
        .then((response) => {
          console.log(response.filename);
          res.sendFile(response.filename);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (e) {
      next(e);
    }
  },
  /*
   getByCode: async function (req, res, next) {
    try {
      console.log(req.params);
      const events = await eventsModel.find({ code: parseInt(req.params) });
      console.log(events);
      res.json(events);
    } catch (e) {
      next(e);
    }
  }, 
  getById: async function (req, res, next) {
    try {
      const events = await eventsModel.find({ _id: req.params.id });

      res.json(events);
    } catch (e) {
      next(e);
    }
  },

  delete: async function (req, res, next) {
    try {
      const deleted = await eventsModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },

  unlink: async function (req, res, next) {
    try {
      console.log(req.body);
      const { eventId, orderCode } = req.body;

      const update = await eventsModel.updateOne(
        { _id: eventId },
        { $pull: { orders: orderCode } },
        { multi: true }
      );

      const updatePurchaseOrders = await purchaseOrdersModel.updateOne(
        { code: orderCode },
        { event: "Sin asociar" }
      );

      console.log(update, updatePurchaseOrders);

      res.json(updatePurchaseOrders);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  link: async function (req, res, next) {
    console.log("BODY:", req.body, "PARAMS:", req.params);

    try {
      const update = await eventsModel.updateOne(
        { code: req.params.code },
        { $push: { orders: req.body.orders } },
        { multi: true }
      );

      console.log(update);
      res.json(update);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await eventsModel.find({}).sort({ code: -1 }).limit(1);
      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
