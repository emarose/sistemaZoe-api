const titularesModel = require("../models/titularesModel");

module.exports = {
  create: async function (req, res, next) {
    console.log(req.body);

    try {
      const document = new titularesModel({
        codigo: req.body.codigo,
        alias: req.body.alias,
        ciudad: req.body.ciudad,
        precioCongelado: parseInt(req.body.precioCongelado),
        precioFresco: parseInt(req.body.precioFresco),
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  getAll: async function (req, res, next) {
    try {
      const document = await titularesModel.find();
      console.log(document);
      res.json(document);
    } catch (e) {
      next(e);
    }
  },
  /* 
  getByName: async function (req, res, next) {
    try {
      const customer = await customersModel.find({ name: req.params.name });
      console.log(customer);
      res.json(customer);
    } catch (e) {
      next(e);
    }
  },
  create: async function (req, res, next) {
    try {
      const document = new customersModel({
        code: req.body.code,
        name: req.body.name,
        address: req.body.address,
        contact: req.body.contact,
        notes: req.body.notes === " " ? "Sin observaciones" : req.body.notes,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  delete: async function (req, res, next) {
    try {
      const deleted = await customersModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
  update: async function (req, res, next) {
    try {
      const doc = await customersModel.findOne({ _id: req.params.id });
      const update = { [req.body[0].searchField]: req.body[0].update };
      await doc.updateOne(update);
      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await customersModel.find({}).sort({ code: -1 }).limit(1);

      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
