const express = require("express");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const cors = require("cors");

require("dotenv").config();

const movimientosRouter = require("./routes/movimientosRoute");
const hojasRutaRouter = require("./routes/hojasRutaRoute");
const cuentasCorrientesRouter = require("./routes/cuentasCorrientesRoute");
const reportesRouter = require("./routes/reportesRoute");
const loginRouter = require("./routes/loginRoute");

const app = express();

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
app.use("/login", loginRouter);

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
