var express = require("express");
var router = express.Router();
const hojasRutaController = require("../controllers/hojasRutaController");

router.get("/", hojasRutaController.getAll);
router.post("/add", hojasRutaController.create);
router.get("/:codigo", hojasRutaController.getByName);
/* router.get("/countEvents", eventsController.amount);
router.get("/byId/:id", eventsController.getById);
router.put("/:id", eventsController.update);
router.delete("/:id", eventsController.delete);
router.put("/unlink/:code", eventsController.unlink);
router.put("/link/:code", eventsController.link);
 */
module.exports = router;
