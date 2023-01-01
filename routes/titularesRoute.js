var express = require("express");
var router = express.Router();
const titularesController = require("../controllers/titularesController");

router.post("/add", titularesController.create);
router.get("/", titularesController.getAll);
router.put("/", titularesController.modificar);
router.get("/getByName/:name", titularesController.getByName);

module.exports = router;
