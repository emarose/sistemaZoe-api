var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const hojasRutaSchema = mongoose.Schema({
  movimientos: {
    type: Array,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  importeTotal: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    default: Date.now,
    unique: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cajasTotal: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  kgTotal: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

hojasRutaSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("hojasRuta", hojasRutaSchema);
