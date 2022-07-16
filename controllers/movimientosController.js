const movimientosModel = require("../models/movimientosModel");

module.exports = {
  /*  getAll: async function (req, res, next) {
    try {
      const products = await productsModel.find();

      res.json(products);
    } catch (e) {
      next(e);
    }
  },
  getById: async function (req, res, next) {
   
    try {
      const documents = await productsModel.findById(req.params.id);
      res.json(documents);
    } catch (e) {
      next(e);
    }
  },
  create: async function (req, res, next) {
    try {
      const data = new productsModel({
        code: req.body.code,
        productName: req.body.productName,
        category: req.body.category,
        price: req.body.price,
        cost: req.body.cost || 0,
        details: req.body.details === " " ? "Sin detalles" : req.body.details,
      });
      const document = await data.save();

      res.status(201).json(document);
    } catch (e) {
      console.log(e);
      e.status = 400;
      next(e);
    }
  },
  update: async function (req, res, next) {
    console.log(req.body[0].searchField);

    try {
      const doc = await productsModel.findOne({ _id: req.params.id });
      const update = { [req.body[0].searchField]: req.body[0].update };
      await doc.updateOne(update);

      res.json(doc);
    } catch (e) {
      console.log(e);
    }
  },
  delete: async function (req, res, next) {
    try {
      console.log(req.body);
      const deleted = await productsModel.deleteOne({ _id: req.params.id });
      res.json(deleted);
    } catch (e) {
      next(e);
    }
  },
  amount: async function (req, res, next) {
    try {
      const amount = await productsModel.find({}).sort({ code: -1 }).limit(1);

      amount[0] ? res.json(amount[0].code) : res.json(0);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }, */
};
