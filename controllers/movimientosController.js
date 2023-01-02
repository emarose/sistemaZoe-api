const movimientosModel = require("../models/movimientosModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const formatDateString = require("../util/utils");

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
  /* remake BE */
  nuevoMovimiento: async function (req, res, next) {
    const fecha = new Date(req.body.fecha);
    const {
      cliente,
      planta,
      concepto,
      vehiculo,
      cajas,
      kgCong,
      importe,
      precioFresco,
      precioCongelado,
    } = req.body;

    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const cuentaCorriente = await cuentasCorrientesModel.find({
        titular: cliente,
      });

      const nuevo_balance = cuentaCorriente[0].balance + importe;

      const data = new movimientosModel({
        cliente: cliente,
        planta: planta,
        concepto: concepto,
        vehiculo: vehiculo,
        cajas: cajas,
        kgCong: kgCong,
        importe: importe,
        fecha: fecha,
        precioFresco: precioFresco,
        precioCongelado: precioCongelado,
        tipo: "SALIDA",
        nuevo_balance: nuevo_balance,
      });

      const document = await data.save();

      res.json(document);
    } catch (e) {
      console.log(e);

      next(e);
    }
  },
  nuevoPago: async function (req, res, next) {
    const { fecha, codigo, planta, concepto, monto } = req.body.data;
    let formatFecha = new Date(fecha);

    formatFecha.setHours(4);
    formatFecha.setMinutes(0);
    formatFecha.setMilliseconds(0);
    formatFecha.setSeconds(0);

    const cuentaCorriente = await cuentasCorrientesModel.find({
      titular: codigo,
    });
    if (cuentaCorriente.length !== 0) {
      try {
        const document = new movimientosModel({
          cliente: codigo,
          planta: planta,
          concepto: concepto,
          importe: monto,
          fecha: formatFecha,
          tipo: "ENTRADA",
        });

        const response = await document.save();

        res.json(response);
      } catch (e) {
        console.log(e);
        next(e);
      }
    } else {
      res.status(300);
      res.json("no existe el cliente");
    }
  },
  editarPago: async function (req, res, next) {
    const { concepto, fecha } = req.body;
    const importe = parseInt(req.body.importe);

    let formatFecha = new Date(fecha);
    formatFecha.setHours(4);
    formatFecha.setMinutes(0);
    formatFecha.setMilliseconds(0);
    formatFecha.setSeconds(0);

    try {
      const doc = await movimientosModel.findOne({ _id: req.params.id });
      const update = { fecha, importe, concepto };
      await doc.updateOne(update);

      console.log(update);
      res.json(doc);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  getAllPagosByName: async function (req, res, next) {
    const cliente = req.params.name;

    /* PAGINATION */
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit;

    try {
      const totalDocuments = await movimientosModel
        .find({ tipo: "ENTRADA" })
        .countDocuments();
      const ultimaPagina = Math.ceil(totalDocuments / limit);

      /* Buscar todos los pagos (ENTRADAS) por cliente */
      const documents = await movimientosModel
        .find({ cliente: cliente, tipo: "ENTRADA" })
        .limit(limit)
        .skip(skip)
        .sort({ fecha: -1 });

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
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
        tipo: "ENTRADA",
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

    const fecha = new Date(req.query.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const totalDocuments = await cuentasCorrientesModel
        .find()
        .countDocuments();

      const documents = await movimientosModel
        .find({
          fecha: fecha,
        })
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      let ultimaPagina = Math.ceil(totalDocuments / perPage);
      /*  const movimientos = await movimientosModel.find({
        titular: req.params.cliente,
      });

      const cuentaCorriente = await cuentasCorrientesModel.find({
        titular: req.params.cliente,
      });

       let sumaPagos = 0;
      let sumaMovimientos = 0;
      let sumaCongelado = 0;
      let sumaFresco = 0;

      movimientos.forEach((element) => {
        switch (element.tipo) {
          case "ENTRADA":
            sumaPagos += element.importe;
            break;
          case "SALIDA":
            sumaCongelado +=
              cuentaCorriente[0].precioCongelado * element.kgCong;
            sumaFresco += cuentaCorriente[0].precioFresco * element.cajas;
            sumaMovimientos = sumaFresco + sumaCongelado;
            break;
        }
      });

      console.log("sumaPagos: ", sumaPagos);
      console.log("sumaMovimientos: ", sumaMovimientos); */
      res.json([documents, ultimaPagina]);
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
    const page = req.query.page || 0;
    const perPage = 30;

    try {
      const totalDocuments = await movimientosModel.find().countDocuments();
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      const movimientos = await movimientosModel
        .find({
          cliente: req.params.name,
        })
        .limit(perPage)
        .skip(parseInt(page) * perPage)
        .sort({ fecha: 1 });

      const cuentaCorriente = await cuentasCorrientesModel.find({
        titular: req.params.name,
      });

      const newData = JSON.parse(JSON.stringify(movimientos));

      let sumaPagos = 0;
      let sumaMovimientos = 0;
      let sumaCongelado = 0;
      let sumaFresco = 0;

      newData.map((movimiento) => {
        switch (movimiento.tipo) {
          case "ENTRADA":
            sumaPagos += movimiento.importe;
            break;
          case "SALIDA":
            sumaCongelado +=
              cuentaCorriente[0].precioCongelado * movimiento.kgCong;
            sumaFresco += cuentaCorriente[0].precioFresco * movimiento.cajas;
            if (movimiento.precioCongelado !== 0) {
              sumaMovimientos = sumaFresco + sumaCongelado;
            } else {
              sumaMovimientos += movimiento.importe;
            }
            break;
        }

        Object.assign(movimiento, { saldo: sumaMovimientos - sumaPagos });
      });

      if (newData.length === 0) {
        res.status(300);
        res.json("No hay movimientos asociados al cliente");
      } else {
        res.json([newData, ultimaPagina]);
      }
    } catch (e) {
      next(e);
    }
  },
  deleteMovement: async function (req, res, next) {
    const movementId = req.params.id;
    const titular_id = req.body.titular;
    try {
      const movimiento = await movimientosModel.find({ _id: movementId });
      const importe = movimiento[0].importe;
      const document = await cuentasCorrientesModel.updateOne(
        { titular_id: titular_id },
        { $inc: { balance: -importe } }
      );
      const deleted = await movimientosModel.deleteOne({ _id: movementId });

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  deletePago: async function (req, res, next) {
    const movementId = req.params.id;
    const titular_id = req.body.titular;
    try {
      const movimiento = await movimientosModel.find({ _id: movementId });
      const importe = movimiento[0].importe;
      const document = await cuentasCorrientesModel.updateOne(
        { titular_id: titular_id },
        { $inc: { balance: +importe } }
      );
      const deleted = await movimientosModel.deleteOne({ _id: movementId });
      console.log(deleted);

      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  editMovement: async function (req, res, next) {
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
