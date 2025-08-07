const express = require("express");
const router = express.Router();

const {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty
} = require("../../controllers/admission/studentlist_controller");

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/faculties", getFaculty);

module.exports = router;
