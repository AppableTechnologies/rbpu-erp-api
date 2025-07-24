const express = require("express");
const router = express.Router();

const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../../controllers/academic/student_controller");

router.get("/", getStudents);
router.post("/create", createStudent);
router.put("/update/:id", updateStudent);
router.delete("/delete/:id", deleteStudent);

module.exports = router;