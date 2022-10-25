const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");
const titularesModel = require("../models/titularesModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
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
    const { codigo, concepto, monto, fecha } = req.body.data;

    const formatedFecha = new Date(fecha);
    formatedFecha.setHours(4);
    formatedFecha.setMinutes(0);
    formatedFecha.setMilliseconds(0);
    formatedFecha.setSeconds(0);

    console.log("BODY::::::::", req.body.data);

    const movimientos = await movimientosModel
      .find({ cliente: codigo })
      .sort({ formatedFecha: -1 });

    const titular = await titularesModel
      .find({ codigo: codigo })
      .sort({ formatedFecha: -1 });

    console.log(titular[0]._id);

    const cuentaCorriente = await cuentasCorrientesModel
      .find({ titularId: titular[0]._id })
      .sort({ formatedFecha: -1 });

    console.log(cuentaCorriente[0]._id);

    const pagos = await pagosModel.find({ cliente: codigo }).sort({ _id: -1 });

    const pagosMovimientos = [...movimientos, ...pagos];

    const ordered = [...pagosMovimientos].sort((a, b) =>
      a.fecha > b.fecha ? 1 : -1
    );

    const ultimoSaldoActual = ordered.slice(-1)[0].saldo_actual;

    console.log("ULTIMO SALDOA ACTUAL:::", ultimoSaldoActual);

    try {
      const document = new pagosModel({
        cliente: codigo,
        monto: monto,
        concepto: concepto,
        fecha: formatedFecha,
        cuentaCorriente_id: cuentaCorriente[0]._id,
        saldo_actual: ultimoSaldoActual - monto,
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
