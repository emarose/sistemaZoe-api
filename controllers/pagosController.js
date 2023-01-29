const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");
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

    const movimientos = await movimientosModel
      .find({ cliente: codigo })
      .sort({ formatedFecha: -1 });

    const titular = await cuentasCorrientesModel.find({ codigo: codigo });

    const cuentaCorriente = await cuentasCorrientesModel
      .find({ titular_id: titular[0]._id })
      .sort({ formatedFecha: -1 });

    const updateHaber = await cuentasCorrientesModel.updateOne(
      { titular_id: titular[0]._id },
      { $inc: { haber: parseInt(monto) } }
    );

    const pagos = await pagosModel.find({ cliente: codigo }).sort({ _id: -1 });

    const pagosMovimientos = [...movimientos, ...pagos];

    const ordered = [...pagosMovimientos].sort((a, b) =>
      a.fecha > b.fecha ? 1 : -1
    );

    const ultimoSaldoActual = ordered.slice(-1)[0]
      ? ordered.slice(-1)[0].saldo_actual
      : 0;

    /*  const ultimoSaldoActual = parseInt(
      cuentaCorriente[0].haber - cuentaCorriente[0].debe
    ); */

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
      console.log(document);
      res.json(response);
    } catch (e) {
      console.log(e);

      next(e);
    }
  },
  deletePago: async function (req, res, next) {
    const pagoId = req.params.id;
    const cliente = req.body.cliente;
    console.log(pagoId, cliente);

    try {
      const pago = await pagosModel.find({ _id: pagoId });
      let monto = pago[0].monto;

      console.log(monto);
      const titular_id = await cuentasCorrientesModel.find({
        titular: cliente,
      });

      const document = await cuentasCorrientesModel.updateOne(
        { titular: cliente },
        { $inc: { haber: parseInt(-monto) } }
      );
      console.log(document);

      const deleted = await pagosModel.deleteOne({ _id: pagoId });

      console.log(deleted);

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
};
