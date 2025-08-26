const express = require("express");
const router = express.Router();
const {
  getFeesDiscounts,
  createFeesDiscount,
  updateFeesDiscount,
  deleteFeesDiscount,
} = require("../../controllers/fees/feesDIscounts_controller");

router.get("/", getFeesDiscounts);
router.post("/", createFeesDiscount);
router.put("/:id", updateFeesDiscount);
router.delete("/:id", deleteFeesDiscount);

module.exports = router;