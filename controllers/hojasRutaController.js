const hojasRutaModel = require("../models/hojasRutaModel");
const formatDateString = require("../util/utils");

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
    console.log(req.body);
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

      const response = await document.save();

      res.json(response);
    } catch (e) {
      /*    res.status=400
      e.status=400 */
      next(e);
    }
  },
  getByName: async function (req, res, next) {
    try {
      const document = await titularesModel.find({ codigo: req.params.codigo });
      console.log(document);
      res.json(document);
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
