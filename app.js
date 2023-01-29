var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
require("dotenv").config();

var movimientosRouter = require("./routes/movimientosRoute");
var hojasRutaRouter = require("./routes/hojasRutaRoute");
var cuentasCorrientesRouter = require("./routes/cuentasCorrientesRoute");
var reportesRouter = require("./routes/reportesRoute");

var titularesRouter = require("./routes/titularesRoute");

var app = express();
var cors = require("cors");

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/cuentasCorrientes", cuentasCorrientesRouter);
app.use("/movimientos", movimientosRouter);
app.use("/hojasRuta", hojasRutaRouter);
app.use("/reportes", reportesRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: true, message: err.message });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Express conectado al puerto", process.env.PORT || 3000);
});

module.exports = app;
