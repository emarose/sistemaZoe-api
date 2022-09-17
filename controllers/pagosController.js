const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");

const formatDateString = require("../util/utils");

module.exports = {
  getAll: async function (req, res, next) {
    try {
      const document = await pagosModel.find();
      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  getByCliente: async function (req, res, next) {
    const page = req.query.page;
    const perPage = req.query.limit;

    // busco la cantidad de documentos

    const totalDocuments = await pagosModel.find().countDocuments();

    try {
      const document = await pagosModel
        .find({ cliente: req.params.cliente })
        .limit(perPage)
        .sort({ fecha: 1 })
        .skip(parseInt(page) * perPage);

      let documentLenght = parseInt(Object.values(document).length);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([document, ultimaPagina]);
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

    const movimientos = await movimientosModel
      .find({ cliente: req.body.codigo })
      .sort({ _id: -1 });

    console.log(movimientos);
    const pagos = await pagosModel
      .find({ cliente: req.body.codigo })
      .sort({ _id: -1 });

    const pagosMovimientos = [...movimientos, ...pagos];

    console.log(pagosMovimientos);

    const ordered = [...pagosMovimientos].sort((a, b) =>
      a.fecha > b.fecha ? 1 : -1
    );

    console.log(ordered);

    const ultimoSaldoActual = ordered.slice(-1)[0].saldo_actual;

    console.log(ultimoSaldoActual);

    /*     const saldo_anterior = saldoUltimoMovimientoEnLaFecha; */
    try {
      const document = new pagosModel({
        cliente: req.body.codigo,
        monto: req.body.monto,
        concepto: req.body.concepto,
        fecha: req.body.fecha,
        cuentaCorriente_id: req.body.cuentaCorriente_id,
        saldo_actual: ultimoSaldoActual - req.body.monto,
        saldo_anterior: ultimoSaldoActual,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);

      next(e);
    }
  },
};
