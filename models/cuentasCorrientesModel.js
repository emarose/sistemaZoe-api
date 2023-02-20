const mongoose = require("mongoose");
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
  isActive: {
    default: true,
    type: Boolean,
  },
});

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

// Validate the input before saving to the database
cuentasCorrientesSchema.pre("save", function (next) {
  const cliente = this.cliente;
  const ciudad = this.ciudad;
  const precioCongelado = this.precioCongelado;
  const precioFresco = this.precioFresco;

  // Regular expression to filter out special characters
  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(cliente) ||
    !regex.test(ciudad) ||
    !regex.test(precioCongelado) ||
    !regex.test(precioFresco)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
});

// Validate the input before updating to the database
cuentasCorrientesSchema.pre("findOneAndUpdate", function (next) {
  const { titular, ciudad, precioFresco, precioCongelado } = this._update;

  // Regular expression to filter out special characters
  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(titular) ||
    !regex.test(ciudad) ||
    !regex.test(precioCongelado) ||
    !regex.test(precioFresco)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
});

cuentasCorrientesSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("cuentasCorrientes", cuentasCorrientesSchema);
