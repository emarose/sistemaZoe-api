var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
require("dotenv").config();

var titularesRouter = require("./routes/titularesRoute");
var vehiculosRouter = require("./routes/vehiculosRoute");
var movimientosRouter = require("./routes/movimientosRoute");
var hojasRutaRouter = require("./routes/hojasRutaRoute");
var cuentasCorrientesRouter = require("./routes/cuentasCorrientesRoute");
var pagosRouter = require("./routes/pagosRoute");
var reportesRouter = require("./routes/reportesRoute");
var app = express();
var cors = require("cors");

/* var baseUrl = process.env.baseURL || "http://localhost:3000";
 */
app.use(bodyParser.json());
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/cuentasCorrientes", cuentasCorrientesRouter);
app.use("/pagos", pagosRouter);
app.use("/titulares", titularesRouter);
app.use("/vehiculos", vehiculosRouter);
app.use("/movimientos", movimientosRouter);
app.use("/hojasRuta", hojasRutaRouter);
app.use("/reportes", reportesRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: true, message: err.message });
});

app.listen(/* process.env.PORT ||  */ 3000, () => {
  console.log("Express conectado");
});

module.exports = app;
