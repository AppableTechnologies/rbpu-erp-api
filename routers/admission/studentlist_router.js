const express = require("express");
const router = express.Router();

const {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty,
  getProgramsViaFacultyId,
  getSessionsViaProgramId
} = require("../../controllers/admission/studentlist_controller");

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/faculties", getFaculty);
router.get("/programs", getProgramsViaFacultyId);
router.get("/sessions-by-program", getSessionsViaProgramId);

module.exports = router;
