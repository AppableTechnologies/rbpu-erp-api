const express = require("express");
const router = express.Router();
const {
  getIdCards,
  // getIdCardByStudentId
} = require("../../../controllers/admission/IdCards/IdCards_Controller");
router.get("/", getIdCards);
// router.get("/:id", getIdCardByStudentId);
module.exports = router;