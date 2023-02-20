const mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const movimientosSchema = new mongoose.Schema({
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
    min: 0,
  },
  kgCong: {
    type: Number,
    min: 0,
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
  },
  precioCongelado: {
    type: Number,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

movimientosSchema.virtual("importe_currency").get(function () {
  if (this.importe === undefined) return;
  let importe = this.importe.toFixed(2).replace(".", ",");
  return `$ ${String(importe).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

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

/* movimientosSchema.pre("save", function (next) {
  const cliente = this.cliente;
  const planta = this.planta;
  const concepto = this.concepto;
  const cajas = this.cajas;
  const kgCong = this.kgCong;
  const importe = this.importe;

  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(cliente) ||
    !regex.test(planta) ||
    !regex.test(concepto) ||
    !regex.test(cajas) ||
    !regex.test(kgCong) ||
    !regex.test(importe)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
}); */

// Validate the input before updating to the database
/* movimientosSchema.pre("updateOne", function (next) {
  const {
    cliente,
    planta,
    concepto,
    cajas,
    kgCong,
    importe,
    precioFresco,
    precioCongelado,
  } = this._update;

  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(cliente) ||
    !regex.test(planta) ||
    !regex.test(concepto) ||
    !regex.test(cajas) ||
    !regex.test(kgCong) ||
    !regex.test(importe) ||
    !regex.test(precioFresco) ||
    !regex.test(precioCongelado)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
}); */

movimientosSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("movimientos", movimientosSchema);
