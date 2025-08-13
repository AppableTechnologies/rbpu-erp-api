const express = require("express");
const router = express.Router();
const {
  getFeesTypes,
  createFeesType,
  updateFeesType,
  deleteFeesType
} = require("../../controllers/fees/feestypes_controller");

router.get("/", getFeesTypes);
router.post("/", createFeesType);
router.put("/:id", updateFeesType);
router.delete("/:id", deleteFeesType);

module.exports = router;
