var express = require("express");
var router = express.Router();
const pagosController = require("../controllers/pagosController");

router.get("/", pagosController.getAll);
router.get("/getByCliente/:cliente", pagosController.getByCliente);
router.post("/add", pagosController.create);
/* 
router.get("/countInputs", inputsController.amount);
router.delete("/:id", inputsController.delete);
router.put("/:id", inputsController.update); */

module.exports = router;
