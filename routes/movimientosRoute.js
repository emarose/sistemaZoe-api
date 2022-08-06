var express = require("express");
var router = express.Router();
const movimientosController = require("../controllers/movimientosController");

router.post("/add", movimientosController.create);
router.post("/byDate", movimientosController.byDate);
router.post("/betweenDates", movimientosController.betweenDates);
router.get("/", movimientosController.getAll);
router.get("/getByName/:name", movimientosController.getByName);

/*router.delete("/:id", categoriesController.delete);
router.put("/:id", categoriesController.update);
router.get("/countCategories", categoriesController.amount); */

module.exports = router;
