const cuentasCorrientesModel = require("../models/cuentasCorrientesModel");
const pagosModel = require("../models/pagosModel");
const movimientosModel = require("../models/movimientosModel");
const titularesModel = require("../models/titularesModel");

module.exports = {
  getAll: async function (req, res, next) {
    const page = req.query.page;
    const perPage = req.query.limit;
    try {
      // busco la cantidad de documentos
      const totalDocuments = await cuentasCorrientesModel
        .find()
        .countDocuments();

      // busco los documentos, limitados
      const documentsFound = await cuentasCorrientesModel
        .find()
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      // divido el total de documentos por la cantidad que quiero traer por página
      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      // devuelvo los documentos encontrados y la ultima pagina
      res.json([documentsFound, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  },
  create: async function (req, res, next) {
    try {
      const document = new cuentasCorrientesModel({
        titular_id: req.params.id,
        debe: 0,
        isActive: true,
        haber: 0,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      /*    res.status=400
      e.status=400 */
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    const name = req.params.name;

    try {
      const titular = await titularesModel.find({
        codigo: name,
      });
      console.log(titular);

      const document = await cuentasCorrientesModel.find({
        titular_id: titular[0]._id,
      });

      res.json(document[0]);
    } catch (e) {
      next(e);
    }
  },
  getById: async function (req, res, next) {
    const id = req.params.id;
    try {
      const document = await cuentasCorrientesModel.find({
        titular_id: id,
      });

      res.json(document[0]);
    } catch (e) {
      next(e);
    }
  },
  agregarAlHaber: async function (req, res, next) {
    const cuentaCorriente_id = req.body.cuentaCorriente_id;
    let monto = parseInt(req.body.monto);

    try {
      const document = await cuentasCorrientesModel.updateOne(
        { _id: cuentaCorriente_id },
        { $inc: { haber: monto } }
      );
      console.log(document);
      res.json(`Agregados ${monto} al haber.`);
    } catch (e) {
      next(e);
    }
  },
  agregarAlDebe: async function (req, res, next) {
    console.log("AGREGAR AL DEBE:", req.body);
    const cuentaCorriente_id = req.body.cuentaCorriente_id;
    let monto = parseInt(req.body.monto);

    try {
      const document = await cuentasCorrientesModel.updateOne(
        { _id: cuentaCorriente_id },
        { $inc: { debe: monto } }
      );
      console.log(document);
      res.json(`Agregados ${monto} al debe.`);
    } catch (e) {
      next(e);
    }
  },
  restarDebe: async function (req, res, next) {
    console.log("RESTAR AL DEBE:", req.body);
    const cuentaCorriente_id = req.body.cuentaCorriente_id;
    let monto = parseInt(req.body.monto);

    try {
      const document = await cuentasCorrientesModel.updateOne(
        { _id: cuentaCorriente_id },
        { $inc: { debe: -monto } }
      );
      console.log(document);
      res.json(`Restados ${monto} al debe.`);
    } catch (e) {
      next(e);
    }
  },
  getMovimientosYPagos: async function (req, res, next) {
    const cliente = req.params.name;
    const page = req.query.page;
    const perPage = req.query.limit;

    try {
      // busco la cantidad de documentos
      const pagosDocuments = await pagosModel
        .find({ cliente: cliente })
        .countDocuments();

      const movimientosDocuments = await movimientosModel
        .find({ cliente: cliente })
        .countDocuments();

      let totalDocuments = movimientosDocuments + pagosDocuments;

      const movimientos = await movimientosModel
        .find({ cliente: cliente })
        .sort({ _id: -1 })
        .limit(perPage)
        .skip(parseInt(page) * perPage);

      const pagos = await pagosModel
        .find({ cliente: cliente })
        .limit(perPage)
        .sort({ _id: -1 })
        .skip(parseInt(page) * perPage);

      let pagosYdocumentos = [...pagos, ...movimientos];

      const ordered = [...pagosYdocumentos].sort((a, b) =>
        a.fecha < b.fecha ? -1 : 1
      );

      let ultimaPagina = Math.ceil(totalDocuments / perPage);

      res.json([ordered, ultimaPagina]);
    } catch (e) {
      next(e);
    }
  } /*
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
  }, */,
};
