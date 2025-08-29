const express = require("express");
const router = express.Router();
const {
  getFeesFines,
  createFeesFine,
  updateFeesFine,
  deleteFeesFine,
} = require("../../controllers/fees/feesFine_controller");

router.get("/", getFeesFines);
router.post("/", createFeesFine);
router.put("/:id", updateFeesFine);
router.delete("/:id", deleteFeesFine);

module.exports = router;