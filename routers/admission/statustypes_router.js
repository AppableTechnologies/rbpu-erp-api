const express = require("express");
const router = express.Router();
const {
  getStatusTypes,
  createStatusType,   
  updateStatusType,   
  deleteStatusType   
} = require("../../controllers/admission/statustypes_controller");

router.get("/", getStatusTypes);
router.post("/", createStatusType);
router.put("/:id", updateStatusType);
router.delete("/:id", deleteStatusType);

module.exports = router;
