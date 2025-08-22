const express = require("express");
const router = express.Router();
// const { getProgramsViaFacultyId, getSessionsViaProgramId } = require("../../controllers/admission/studentlist_controller");

const {
  getSemestersViaProgramId,
  getSectionsViaSemesterId
} = require("../../../controllers/admission/student_list/session_semester_section");

router.get("/semesters-by-program", getSemestersViaProgramId);
router.get("/sections-by-semester", getSectionsViaSemesterId);

module.exports = router;
