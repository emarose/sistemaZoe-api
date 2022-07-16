var express = require("express");
var router = express.Router();
const titularesController = require("../controllers/titularesController");

router.post("/add", titularesController.create);
router.get("/", titularesController.getAll);
/* router.get("/countCustomers", customersController.amount);
router.get("/:name", customersController.getByName);

router.delete("/:id", customersController.delete);
router.put("/:id", customersController.update); */

module.exports = router;
