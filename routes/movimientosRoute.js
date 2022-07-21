var express = require("express");
var router = express.Router();
const movimientosController = require("../controllers/movimientosController");

router.post("/add", movimientosController.create);
router.get("/", movimientosController.getAll);
/*
router.delete("/:id", categoriesController.delete);
router.put("/:id", categoriesController.update);
router.get("/countCategories", categoriesController.amount); */

module.exports = router;
