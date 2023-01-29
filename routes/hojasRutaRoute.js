var express = require("express");
var router = express.Router();
const hojasRutaController = require("../controllers/hojasRutaController");

router.get("/", hojasRutaController.getAll);
router.get("/betweenDates", hojasRutaController.betweenDates);
router.post("/add", hojasRutaController.create);
router.get("/getByDate/:date", hojasRutaController.getByDate);
router.put("/:id", hojasRutaController.modificar);
router.delete("/remove/:date", hojasRutaController.eliminar);

module.exports = router;
