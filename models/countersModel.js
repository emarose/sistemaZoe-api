const mongoose = require("../bin/mongodb");

const countersSchema = new mongoose.Schema({
  _id: Object,
  category_counter: { type: Number, default: 0, min: 0, unique: true },
  product_counter: { type: Number, default: 0, min: 0, unique: true },
});

module.exports = mongoose.model("counters", countersSchema);
