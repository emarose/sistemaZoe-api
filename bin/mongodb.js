var mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://emarose:12Metallica12@cluster0.wj35z.mongodb.net/sistemaZoe?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  function (error) {
    if (error) {
      throw error;
    } else {
      console.log("Conectado a MongoDB");
    }
  }
);
module.exports = mongoose;
