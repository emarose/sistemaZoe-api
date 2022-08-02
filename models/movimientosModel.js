var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const movimientosSchema = mongoose.Schema({
  cliente: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  planta: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  vehiculo: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cajas: {
    type: Number,
    default: 0,
  },
  kgCong: {
    type: Number,
    default: 0,
  },
  importe: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  precioFresco: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  precioCongelado: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  saldo_actual: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  saldo_anterior: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

movimientosSchema.virtual("precioCongelado_currency").get(function () {
  let precioCongelado = this.precioCongelado.toFixed(2).replace(".", ",");
  return `$ ${String(precioCongelado).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

movimientosSchema.virtual("precioFresco_currency").get(function () {
  let precioFresco = this.precioFresco.toFixed(2).replace(".", ",");
  return `$ ${String(precioFresco).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
movimientosSchema.virtual("importe_currency").get(function () {
  let importe = this.importe.toFixed(2).replace(".", ",");
  return `$ ${String(importe).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

movimientosSchema.virtual("saldo_anterior_currency").get(function () {
  let saldo_anterior = this.saldo_anterior.toFixed(2).replace(".", ",");
  return `$ ${String(saldo_anterior).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

movimientosSchema.virtual("saldo_actual_currency").get(function () {
  let saldo_actual = this.saldo_actual.toFixed(2).replace(".", ",");
  return `$ ${String(saldo_actual).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
movimientosSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("movimientos", movimientosSchema);
