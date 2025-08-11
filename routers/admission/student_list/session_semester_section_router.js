const express = require("express");
const router = express.Router();
// const { getProgramsViaFacultyId, getSessionsViaProgramId } = require("../../controllers/admission/studentlist_controller");

const {
  getSemestersViaSessionId
} = require("../../../controllers/admission/student_list/session_semester_section");

router.get("/semesters-by-session", getSemestersViaSessionId);

module.exports = router;
