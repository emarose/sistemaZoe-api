const mongoose = require("../bin/mongodb");
const errorMessage = require("../util/errorMessage");

const titularesSchema = new mongoose.Schema({
  codigo: {
    type: String,
    unique: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  alias: {
    type: String,
  },
  ciudad: {
    type: String,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  precioCongelado: {
    type: Number,
    min: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  precioFresco: {
    type: Number,
    min: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  saldo: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

titularesSchema.virtual("precioCongelado_currency").get(function () {
  let precioCongelado = this.precioCongelado.toFixed(2).replace(".", ",");
  return `$ ${String(precioCongelado).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

titularesSchema.virtual("precioFresco_currency").get(function () {
  let precioFresco = this.precioFresco.toFixed(2).replace(".", ",");
  return `$ ${String(precioFresco).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

titularesSchema.virtual("saldo_currency").get(function () {
  let saldo = this.saldo.toFixed(2).replace(".", ",");
  return `$ ${String(saldo).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

titularesSchema.set("toJSON", { getters: true, virtuals: true });
module.exports = mongoose.model("titulares", titularesSchema);
