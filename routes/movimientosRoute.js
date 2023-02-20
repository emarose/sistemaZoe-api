const express = require("express");
const router = express.Router();
const movimientosController = require("../controllers/movimientosController");

/* Todos los movimientos y pagos por fecha */
router.post("/byDateAll", movimientosController.byDateAll);

/* Todos los movimientos y pagos por nombre */
router.get("/getByName/:name", movimientosController.getByName);
/* Todos los movimientos y pagos entre fechas */
router.post("/betweenDatesAll", movimientosController.betweenDatesAll);
/* Eliminar movimiento o pago */
router.post("/delete/:id", movimientosController.deleteMovement);

/* PAGOS */
/* Agregar nuevo pago */
router.post("/nuevoPago", movimientosController.nuevoPago);
/* Pagos por nombre */
router.get("/getAllPagosByName/:name", movimientosController.getAllPagosByName);

/* Pagos por fecha */
router.post("/getAllPagosByDate", movimientosController.getAllPagosByDate);
/* Todos los pagos */
router.get("/pagos", movimientosController.getAllPagos);
/* Editar pago */
router.put("/editarPago/:id", movimientosController.editarPago);

/* MOVIMIENTOS */
/* Todos los movimientos */
router.get("/", movimientosController.getAll);
/* Todos los movimientos por fecha */
router.post("/byDate", movimientosController.movimientosByDate);
/* Agregar nuevo movimiento (Hoja de ruta) */
router.post("/nuevoMovimiento", movimientosController.nuevoMovimiento);
/* Agregar un nuevo movimiento (con Concepto) */
router.post("/addNuevoMovimiento", movimientosController.addNuevoMovimiento);
/* Editar movimiento */
router.put("/:id", movimientosController.editMovement);

module.exports = router;
