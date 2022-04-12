var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var customersRouter = require("./routes/customers");
var productsRouter = require("./routes/products");
var categoriesRouter = require("./routes/categories");
var countersRouter = require("./routes/counters");

var app = express();
var cors = require("cors");

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

//app.use('/', indexRouter);
//app.use("/users", usersRouter)
app.use("/customers", customersRouter);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/counters", countersRouter);

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

module.exports = app;
