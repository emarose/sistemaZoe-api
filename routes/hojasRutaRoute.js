const express = require("express");
const router = express.Router();
const hojasRutaController = require("../controllers/hojasRutaController");

router.post("/add", hojasRutaController.create);
router.get("/", hojasRutaController.getAll);
router.get("/betweenDates", hojasRutaController.betweenDates);
router.get("/getByDate/:date", hojasRutaController.getByDate);
router.put("/:id", hojasRutaController.modificar);
router.delete("/remove/:date", hojasRutaController.eliminar);

module.exports = router;
