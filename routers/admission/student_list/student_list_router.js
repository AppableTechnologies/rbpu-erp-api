const express = require("express");
const router = express.Router();
const { getStudents } = require("../../controllers/admission/student_list_controller");

// GET /api/students?faculty_id=&program_id=&session_id=&semester_id=&section_id=&status=&page=&limit=&search=
router.get("/", getStudents);

module.exports = router;
