const mongoose = require("../bin/mongodb");
const errorMessage = require("../util/errorMessage");

const titularesSchema = new mongoose.Schema({
  codigo: {
    type: String,
    unique: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
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
  cuentasCorrientes_id: {
    type: mongoose.Schema.ObjectId,
    ref: "cuentasCorrientes",
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

titularesSchema.set("toJSON", { getters: true, virtuals: true });
module.exports = mongoose.model("titulares", titularesSchema);
