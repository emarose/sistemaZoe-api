const express = require("express");
const router = express.Router();
const reportesController = require("../controllers/reportesController");

router.post(
  "/resumenCuentaCorriente",
  reportesController.resumenCuentaCorriente
);
router.post("/resumenHoja", reportesController.resumenHoja);

module.exports = router;
