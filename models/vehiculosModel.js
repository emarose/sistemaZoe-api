const mongoose = require("../bin/mongodb");
const errorMessage = require("../util/errorMessage");

const vehiculosSchema = new mongoose.Schema({
  fechaAlta: {
    type: Date,
    default: new Date(),
  },
  unidad: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  alias: {
    type: String,
  },
});

module.exports = mongoose.model("vehiculos", vehiculosSchema);
