var mongoose = require("mongoose");

const url =
  "mongodb+srv://emarose:12Metallica12@cluster0.wj35z.mongodb.net/sistemaZoe?retryWrites=true&w=majority";

mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  function (error) {
    if (error) {
      throw error;
    } else {
      console.log("Conectado a MongoDB");
    }
  }
);
module.exports = mongoose;
