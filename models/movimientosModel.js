var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const movimientosSchema = mongoose.Schema({
  planta: {
    type: String,
    lowercase: true,
    trim: true,
  },
  concepto: {
    type: String,
    lowercase: true,
    trim: true,
  },
  vehiculo: {
    type: String,
    lowercase: true,
    trim: true,
  },
  cajas: {
    type: Number,
    default: 0,
  },
  kgCong: {
    type: Number,
    default: 0,
  },
  cliente: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  importe: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  tipo: {
    type: String,
    uppercase: true,
    enum: ["SALIDA", "ENTRADA"],
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  precioFresco: {
    type: Number,
    default: 0,
  },
  /* nuevo_balance: {
    type: Number,
  }, */
  precioCongelado: {
    type: Number,
    default: 0,
  } /*
  saldo_actual: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  saldo_anterior: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  }, */,
});

movimientosSchema.virtual("importe_currency").get(function () {
  if (this.importe === undefined) return;
  let importe = this.importe.toFixed(2).replace(".", ",");
  return `$ ${String(importe).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

/* movimientosSchema.virtual("nuevo_balance_currency").get(function () {
  let nuevo_balance = this.nuevo_balance.toFixed(2).replace(".", ",");
  return `$ ${String(nuevo_balance).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
}); */

movimientosSchema.virtual("precioCongelado_currency").get(function () {
  if (this.precioCongelado === undefined) return;
  let precioCongelado = this.precioCongelado.toFixed(2).replace(".", ",");
  return `$ ${String(precioCongelado).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

movimientosSchema.virtual("precioFresco_currency").get(function () {
  if (this.precioFresco === undefined) return;
  let precioFresco = this.precioFresco.toFixed(2).replace(".", ",");
  return `$ ${String(precioFresco).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
/* movimientosSchema.virtual("saldo_actual_currency").get(function () {
  let saldo_actual = this.saldo_actual.toFixed(2).replace(".", ",");
  return `$ ${String(saldo_actual).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`; */

movimientosSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("movimientos", movimientosSchema);
