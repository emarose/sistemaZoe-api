const mongoose = require("mongoose");
const db = require("../bin/mongodb");
const errorMessage = require("../util/errorMessage");

const hojasRutaSchema = new mongoose.Schema({
  movimientos: {
    type: Array,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  importeTotal: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  fecha: {
    type: Date,
    unique: true,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  cajasTotal: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  kgTotal: {
    type: Number,
    default: 0,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

hojasRutaSchema.virtual("importeTotal_currency").get(function () {
  let importeTotal = this.importeTotal.toFixed(2).replace(".", ",");
  return `$ ${String(importeTotal).replace(
    /(?<!\,.*)(\d)(?=(?:\d{3})+(?:\,|$))/g,
    "$1."
  )}`;
});

// Validate the input before saving to the database
hojasRutaSchema.pre("save", function (next) {
  const importeTotal = this.importeTotal;
  const cajasTotal = this.cajasTotal;
  const kgTotal = this.kgTotal;

  // Regular expression to filter out special characters
  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(importeTotal) ||
    !regex.test(cajasTotal) ||
    !regex.test(kgTotal)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
});

// Validate the input before updating to the database
hojasRutaSchema.pre("updateOne", function (next) {
  const { importeTotal, cajasTotal, kgTotal } = this._update;

  const regex = /^[a-zA-Z0-9.]+$/;

  if (
    !regex.test(importeTotal) ||
    !regex.test(cajasTotal) ||
    !regex.test(kgTotal)
  ) {
    const error = new Error(`Data contains invalid characters`);
    next(error);
  }

  next();
});

hojasRutaSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("hojasRuta", hojasRutaSchema);
