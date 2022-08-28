var express = require("express");
var router = express.Router();
const movimientosController = require("../controllers/movimientosController");

router.post("/add", movimientosController.create);
router.post("/addNuevoMovimiento", movimientosController.addNuevoMovimiento);

router.post("/byDate", movimientosController.byDate);
router.post("/betweenDates", movimientosController.betweenDates);
router.post("/betweenDatesAll", movimientosController.betweenDatesAll);
router.post("/delete/:id", movimientosController.deleteMovement);
router.put("/:id", movimientosController.editMovement);
router.get("/", movimientosController.getAll);
router.get("/getByName/:name", movimientosController.getByName);

/*router.delete("/:id", categoriesController.delete);
router.put("/:id", categoriesController.update);
router.get("/countCategories", categoriesController.amount); */

module.exports = router;
