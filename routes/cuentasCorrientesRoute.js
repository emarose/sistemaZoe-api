const express = require("express");
const router = express.Router();
const cuentasCorrientesController = require("../controllers/cuentasCorrientesController");

router.post("/add", cuentasCorrientesController.create);
router.get("/", cuentasCorrientesController.getAll);
router.get("/getByName/:name", cuentasCorrientesController.getByName);
router.put("/", cuentasCorrientesController.update);

module.exports = router;
