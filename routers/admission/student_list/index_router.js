const express = require("express");
const router = express.Router();

const FacultyProgramRouter = require("./faculty_program_router");
const ProgramSessionRouter = require("./program_session_router");
const SessionSemesterSectionRouter = require("./session_semester_section_router");
const studentListRouter = require("./student_list_router");

router.use(FacultyProgramRouter);
router.use("/program_session", ProgramSessionRouter);
router.use("/session_semester_section", SessionSemesterSectionRouter);
router.use("/students_list", studentListRouter);

module.exports = router;
