var mongoose = require("mongoose");
const errorMessage = require("../util/errorMessage");

const cuentasCorrientesSchema = mongoose.Schema({
  titular: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "titulares",
  },
  saldoAnterior: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
  saldo: {
    type: Number,
    required: [true, errorMessage.GENERAL.campo_obligatorio],
  },
});

cuentasCorrientesSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model("cuentasCorrientes", cuentasCorrientesSchema);
