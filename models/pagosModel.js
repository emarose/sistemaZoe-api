var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const pagosSchema = new mongoose.Schema({
  monto: {
    type: Number,
    min: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  concepto: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cliente: {
    type: String,
    lowercase: true,
    trim: true,
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
  cuentaCorriente_id: {
    type: mongoose.Schema.ObjectId,
    ref: "cuentasCorrientes",
  },
});

pagosSchema.virtual("monto_currency").get(function () {
  let monto = this.monto.toFixed(2).replace(".", ",");
  return `$ ${String(monto).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

pagosSchema.virtual("saldo_anterior_currency").get(function () {
  let saldo_anterior = this.saldo_anterior.toFixed(2).replace(".", ",");
  return `$ ${String(saldo_anterior).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
pagosSchema.virtual("saldo_actual_currency").get(function () {
  let saldo_actual = this.saldo_actual.toFixed(2).replace(".", ",");
  return `$ ${String(saldo_actual).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
pagosSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("pagos", pagosSchema);
