const express = require("express");
const router = express.Router();

const {
  getClassrooms,
  createClassRoom,
  updateClassroom,
  deleteClassroom,
} = require("../../controllers/academic/classroom_controller");

router.get("/", getClassrooms);
router.post("/create", createClassRoom);
router.put("/update/:id", updateClassroom);
router.delete("/delete/:id", deleteClassroom);

module.exports = router;
