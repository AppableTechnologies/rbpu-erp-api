const express = require("express");
const router = express.Router();
const {
  getSessions,
  createSession,
  updateSession,
} = require("../../controllers/academic/session_controller");

router.get("/", getSessions);
router.post("/create", createSession);
router.put("/update/:id", updateSession);

module.exports = router;
