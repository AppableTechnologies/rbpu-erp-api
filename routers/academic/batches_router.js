const express = require("express");
const router = express.Router();const {
  getBatches,
  createBatch,
  updateClassroom,
  deleteClassroom,
} = require("../../controllers/academic/Batch_controller");


router.get("/", getBatches);
router.post("/",createBatch);


module.exports = router;
