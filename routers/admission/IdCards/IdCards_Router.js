const express = require("express");
const router = express.Router();
const {
  getAllIdCards,
  filterIdCards
} = require("../../../controllers/admission/IdCards/IdCards_Controller");
router.get("/", getAllIdCards);
router.post("/filter", filterIdCards);
module.exports = router;
