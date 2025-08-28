const express = require("express");
const router = express.Router();
const { getStudents, getStudentById } = require("../../../controllers/admission/student_list/student_list_controller");

// GET /api/students?faculty_id=&program_id=&session_id=&semester_id=&section_id=&status=&page=&limit=&search=
router.get("/", getStudents);

router.get("/:id", getStudentById);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { getStudents, getStudentById } = require("../../../controllers/admission/student_list/student_list_controller");

// // GET /api/students_list?filters...
// router.get("/", getStudents);

// // GET single student by ID
// router.get("/:id", getStudentById);

// module.exports = router;

