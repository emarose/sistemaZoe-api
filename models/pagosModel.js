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
    default: Date.now,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cliente: {
    type: String,
    lowercase: true,
    trim: true,
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

pagosSchema.set("toJSON", { getters: true, virtuals: true });

//Creacion modelo (Clase -> POO)
module.exports = mongoose.model("pagos", pagosSchema);
