var express = require("express");
var router = express.Router();
const movimientosController = require("../controllers/movimientosController");

router.post("/add", movimientosController.create);
router.post("/addNuevoMovimiento", movimientosController.addNuevoMovimiento);

router.post("/nuevoPago", movimientosController.nuevoPago);
router.post("/nuevoMovimiento", movimientosController.nuevoMovimiento);
router.put("/editarPago/:id", movimientosController.editarPago);

router.post("/byDate", movimientosController.byDate);

router.post("/betweenDates", movimientosController.betweenDates);
router.post("/betweenDatesAll", movimientosController.betweenDatesAll);
router.post("/deletePago/:id", movimientosController.deletePago);
router.post("/delete/:id", movimientosController.deleteMovement);
router.put("/:id", movimientosController.editMovement);
router.get("/", movimientosController.getAll);
router.get("/getByName/:name", movimientosController.getByName);
router.get("/getAllPagosByName/:name", movimientosController.getAllPagosByName);

module.exports = router;
