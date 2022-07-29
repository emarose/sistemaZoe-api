var express = require("express");
var router = express.Router();
const path = require("path");
const reportes = require("../controllers/reportesController");

router.post("/entrefechas", reportes.entrefechas);
/* router.post("/getByCode/:code", reports.getOrderByCode); */

module.exports = router;
