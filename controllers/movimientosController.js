const movimientosModel = require("../models/movimientosModel");
const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");

const { startOfDay, endOfDay } = require("date-fns");

module.exports = {
  /* Movimientos y pagos por nombre */
  getByName: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 5;
    const skip = parseInt(page) * parseInt(perPage);

    try {
      /* Query para encontrar movimientos y pagos por nombre */
      const movimientos = await movimientosModel
        .find({
          cliente: req.params.name,
          isDeleted: false,
        })
        .limit(perPage)
        .skip(skip)
        .sort({ fecha: 1 });

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({ cliente: req.params.name, isDeleted: false })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      const newData = JSON.parse(JSON.stringify(movimientos));

      let sumaPagos = 0;
      let sumaMovimientos = 0;
      newData.map((movimiento) => {
        switch (movimiento.tipo) {
          case "ENTRADA":
            sumaPagos += movimiento.importe;
            break;
          case "SALIDA":
            sumaMovimientos += movimiento.importe;
            break;
        }
        Object.assign(movimiento, {
          saldo:
            sumaMovimientos - sumaPagos || sumaMovimientos - movimiento.importe,
        });
      });

      if (newData.length === 0) {
        res.status(300).json("No hay movimientos asociados al cliente");
      } else {
        res.json([newData, ultimaPagina]);
      }
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Todos los movimientos y pagos  */
  betweenDatesAll: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 20;
    const skip = parseInt(page) * parseInt(perPage);
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
      /* Query para encontrar movimientos y pagos entre fechas */
      const documents = await movimientosModel
        .find({
          fecha: {
            $gte: startOfDay(fechaInicio),
            $lte: endOfDay(fechaFin),
          },
          isDeleted: false,
        })
        .limit(perPage)
        .skip(skip);

      res.json(documents);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Todos los movimientos y pagos por fecha */
  byDateAll: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 20;
    const skip = parseInt(page) * parseInt(perPage);

    const fechaInicio = new Date(req.body.fecha);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    try {
      /* Query para encontrar movimientos y pagos por fecha */
      const documents = await movimientosModel
        .find({
          fecha: {
            $gte: startOfDay(fechaInicio),
            $lte: endOfDay(fechaInicio),
          },
          isDeleted: false,
        })
        .limit(perPage)
        .skip(skip);

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({
          fecha: {
            $gte: startOfDay(fechaInicio),
            $lte: endOfDay(fechaInicio),
          },
          isDeleted: false,
        })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Eliminar movimiento o pago */
  deleteMovement: async function (req, res, next) {
    const movementId = req.params.id;

    try {
      /* Query para marcar el documento como eliminado (IsDeleted:true) */
      const document = await movimientosModel.updateOne(
        { _id: movementId },
        { $set: { isDeleted: true } }
      );

      res.json(document);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },

  /* -PAGOS- */
  /* Nuevo pago */
  nuevoPago: async function (req, res, next) {
    const { fecha, codigo, planta, concepto, importe } = req.body.data;
    let formatFecha = new Date(fecha);
    console.log(req.body);
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
          importe: parseFloat(importe),
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
      res.status(300).json("Cliente inexistente");
    }
  },
  /* Todos los pagos */
  getAllPagos: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 50;
    const skip = parseInt(page) * parseInt(perPage);

    try {
      /* Query para encontrar todos los pagos */
      const documents = await movimientosModel
        .find({ tipo: "ENTRADA", isDeleted: false })
        .limit(perPage)
        .skip(skip)
        .sort({ fecha: -1 });

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({ tipo: "ENTRADA", isDeleted: false })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  },
  /* Todos los pagos por nombre */
  getAllPagosByName: async function (req, res, next) {
    const cliente = req.params.name;

    const page = req.query.page || 0;
    const perPage = req.query.limit || 50;
    const skip = parseInt(page) * parseInt(perPage);
    try {
      /* Query para encontrar todos los pagos por nombre de titular */
      const documents = await movimientosModel
        .find({ cliente: cliente, tipo: "ENTRADA", isDeleted: false })
        .limit(perPage)
        .skip(skip)
        .sort({ fecha: 1 });

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({ tipo: "ENTRADA", isDeleted: false })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Todos los pagos por FECHA */
  getAllPagosByDate: async function (req, res, next) {
    const fechaInicio = new Date(req.body.fecha);
    fechaInicio.setHours(4);
    fechaInicio.setMinutes(0);
    fechaInicio.setMilliseconds(0);
    fechaInicio.setSeconds(0);

    const page = req.query.page || 0;
    const perPage = req.query.limit || 50;
    const skip = parseInt(page) * parseInt(perPage);

    try {
      /* Query para encontrar todos los pagos por fecha */
      const documents = await movimientosModel
        .find({
          fecha: { $gte: startOfDay(fechaInicio), $lte: endOfDay(fechaInicio) },
          tipo: "ENTRADA",
          isDeleted: false,
        })
        .limit(perPage)
        .skip(skip)
        .sort({ fecha: 1 });

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({
          fecha: { $gte: startOfDay(fechaInicio), $lte: endOfDay(fechaInicio) },
          tipo: "ENTRADA",
          isDeleted: false,
        })
        .countDocuments();

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Editar pago */
  editarPago: async function (req, res, next) {
    const importe = parseInt(req.body.importe);
    const concepto = req.body.concepto;
    const fecha = new Date(req.body.date);
    const id = req.params.id;
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const doc = await movimientosModel.findOne({ _id: id });
      const update = { fecha, importe, concepto };
      await doc.updateOne(update);
      console.log(doc);
      res.json(doc);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },

  /* -MOVIMIENTOS- */
  /* Nuevo movimiento de hoja de ruta */
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
      });

      const document = await data.save();

      res.json(document);
    } catch (e) {
      console.log(e);

      next(e);
    }
  },
  /* Nuevo movimiento con concepto */
  addNuevoMovimiento: async function (req, res, next) {
    const { cliente, concepto, importe } = req.body;
    const fecha = new Date(req.body.fecha);

    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const data = new movimientosModel({
        cliente: cliente,
        concepto: concepto,
        fecha: fecha,
        importe: parseFloat(importe),
        tipo: "SALIDA",
      });

      const document = await data.save();

      res.status(200).json(document);
    } catch (e) {
      console.log(e);
      e.status = 400;
      next(e);
    }
  },
  /* Todos los movimientos (no pagos) */
  getAll: async function (req, res, next) {
    const page = req.query.page || 0;
    const perPage = req.query.limit || 50;
    const skip = parseInt(page) * parseInt(perPage);

    try {
      /* Query para encontrar todos los movimientos */
      const documents = await movimientosModel
        .find({ isDeleted: false, tipo: "SALIDA" })
        .limit(perPage)
        .skip(skip);

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({ isDeleted: false, tipo: "SALIDA" })
        .countDocuments();
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Movimientos por fecha */
  movimientosByDate: async function (req, res, next) {
    const fecha = new Date(req.body.fecha);

    const page = req.query.page || 0;
    const perPage = req.query.limit || 150;
    const skip = parseInt(page) * parseInt(perPage);

    try {
      /* Query para encontrar movimientos por fecha */
      const documents = await movimientosModel
        .find({
          fecha: {
            $gte: startOfDay(fecha),
            $lte: endOfDay(fecha),
          },
          isDeleted: false,
          tipo: "SALIDA",
        })
        .limit(perPage)
        .skip(skip);

      /* Paginacion */
      const totalDocuments = await movimientosModel
        .find({ isDeleted: false, tipo: "SALIDA" })
        .countDocuments();
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([documents, ultimaPagina]);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  /* Editar movimiento */
  editMovement: async function (req, res, next) {
    const { cliente, planta, vehiculo, cajas, kgCong, importe } = req.body;
    console.log(req.body);
    const fecha = new Date(req.body.fecha);
    fecha.setHours(4);
    fecha.setMinutes(0);
    fecha.setMilliseconds(0);
    fecha.setSeconds(0);

    try {
      const document = await movimientosModel.findOne({ _id: req.params.id });
      const update = {
        fecha,
        cliente,
        planta,
        vehiculo,
        cajas,
        kgCong,
        importe,
      };
      await document.updateOne(update);

      res.json(document);
    } catch (e) {
      console.log(e);
    }
  },
};
