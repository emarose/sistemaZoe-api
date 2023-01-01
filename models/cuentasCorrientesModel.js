var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const cuentasCorrientesSchema = new mongoose.Schema({
  titular: {
    lowercase: true,
    unique: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
    type: String,
  },
  ciudad: {
    required: [true, errorMessage.GENERAL.campo_obligatorio],
    type: String,
  },
  precioFresco: {
    required: [true, errorMessage.GENERAL.campo_obligatorio],
    type: Number,
  },
  precioCongelado: {
    required: [true, errorMessage.GENERAL.campo_obligatorio],
    type: Number,
  },
  /*  balance: {
    required: [true, errorMessage.GENERAL.campo_obligatorio],
    default: 0,
    type: Number,
  } 
  debe: {
    default: 0,
    type: Number,
  },
  haber: {
    default: 0,
    type: Number,
  }, */
  activo: {
    default: true,
    type: Boolean,
  },
});
/* 
cuentasCorrientesSchema.virtual("debe_currency").get(function () {
  let debe = this.debe.toFixed(2).replace(".", ",");
  return `$ ${String(debe).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

cuentasCorrientesSchema.virtual("haber_currency").get(function () {
  let haber = this.haber.toFixed(2).replace(".", ",");
  return `$ ${String(haber).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

cuentasCorrientesSchema.virtual("balance_currency").get(function () {
  let balance = this.balance.toFixed(2).replace(".", ",");
  return `$ ${String(balance).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});
 */
cuentasCorrientesSchema.virtual("precioCongelado_currency").get(function () {
  let precioCongelado = this.precioCongelado.toFixed(2).replace(".", ",");
  return `$ ${String(precioCongelado).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

cuentasCorrientesSchema.virtual("precioFresco_currency").get(function () {
  let precioFresco = this.precioFresco.toFixed(2).replace(".", ",");
  return `$ ${String(precioFresco).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

/* cuentasCorrientesSchema.virtual("saldo_currency").get(function () {
  let calc = (this.haber - this.debe).toFixed(2).replace(".", ",");
   let saldo = this.saldo.toFixed(2).replace(".", ",");
  return `$ ${String(calc).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
}); */

cuentasCorrientesSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("cuentasCorrientes", cuentasCorrientesSchema);
