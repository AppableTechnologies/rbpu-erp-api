const express = require("express");
const router = express.Router();const {
  getBatches,
  createBatch,
 updateBatch,
deleteBatch
} = require("../../controllers/academic/Batch_controller");


router.get("/", getBatches);
router.post("/",createBatch);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);


module.exports = router;
