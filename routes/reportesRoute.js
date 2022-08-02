var express = require("express");
var router = express.Router();
const path = require("path");
const reportes = require("../controllers/reportesController");

router.post("/entrefechas", reportes.entrefechas);
router.post("/entrefechasTodos", reportes.entrefechasTodos);
router.post("/resumenHoja", reportes.resumenHoja);

/* router.post("/getByCode/:code", reports.getOrderByCode); */

module.exports = router;
