const vehiculosModel = require("../models/vehiculosModel");

module.exports = {
  /*   getAll: async function (req, res, next) {
    try {
      const categories = await categoriesModel.find();
      //console.log(categories);
      res.json(categories);
    } catch (e) {
      next(e);
    }
  },
  create: async function (req, res, next) {
    try {
      const document = new categoriesModel({
        code: req.body.code,
        name: req.body.name,
      });

      const response = await document.save();

      res.json(response);
    } catch (e) {
      //e.status=200
      next(e);
    }
  },
  delete: async function (req, res, next) {
    try {
      const deleted = await categoriesModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
  update: async function (req, res, next) {
    try {
      console.log(req.body);
      const update = await categoriesModel.updateOne(
        { _id: req.params.id },
        req.body
      );
      res.json(update);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await categoriesModel.find({}).sort({ code: -1 }).limit(1);

      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
