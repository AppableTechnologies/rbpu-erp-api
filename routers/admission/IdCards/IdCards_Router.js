const express = require("express");
const router = express.Router();
const {
  getAllIdCards,
} = require("../../../controllers/admission/IdCards/IdCards_Controller");
router.get("/", getAllIdCards);
module.exports = router;
