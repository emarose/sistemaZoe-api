var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const cuentasCorrientesSchema = new mongoose.Schema({
  titular_id: {
    type: mongoose.Schema.ObjectId,
    ref: "titulares",
  },
  debe: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  haber: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },

  isActive: {
    type: Boolean,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

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

cuentasCorrientesSchema.virtual("saldo_currency").get(function () {
  let calc = (this.haber - this.debe).toFixed(2).replace(".", ",");
  /*  let saldo = this.saldo.toFixed(2).replace(".", ","); */
  return `$ ${String(calc).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

cuentasCorrientesSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("cuentasCorrientes", cuentasCorrientesSchema);
