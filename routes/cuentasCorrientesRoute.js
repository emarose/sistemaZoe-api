var express = require("express");
var router = express.Router();
const cuentasCorrientesController = require("../controllers/cuentasCorrientesController");

router.get("/", cuentasCorrientesController.getAll);
router.post("/add", cuentasCorrientesController.create);
router.put("/haber", cuentasCorrientesController.agregarAlHaber);
router.put("/debe", cuentasCorrientesController.agregarAlDebe);
router.put("/debe/restar", cuentasCorrientesController.restarDebe);
router.get("/getByName/:name", cuentasCorrientesController.getByName);
router.put("/", cuentasCorrientesController.modificar);
router.get("/getById/:id", cuentasCorrientesController.getById);

module.exports = router;
