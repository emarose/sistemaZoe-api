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

hojasRutaSchema.virtual("importeTotal_currency").get(function () {
  let importeTotal = this.importeTotal.toFixed(2).replace(".", ",");
  return `$ ${String(importeTotal).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

hojasRutaSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("hojasRuta", hojasRutaSchema);
