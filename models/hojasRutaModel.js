var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const hojasRutaSchema = mongoose.Schema({
  cliente: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  planta: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cajas: {
    type: Number,
    default: 0,
  },
  kgCongelado: {
    type: Number,
    default: 0,
  },
});

hojasRutaSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("hojasRuta", hojasRutaSchema);
