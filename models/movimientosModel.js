var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const movimientosSchema = mongoose.Schema({
  code: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cantidad: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  category: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

movimientosSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("movimientos", movimientosSchema);
