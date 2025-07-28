const express = require("express");
const router = express.Router();
const {
  getSessions,
} = require("../../controllers/academic/session_controller");

router.get("/", getSessions);

module.exports = router;
