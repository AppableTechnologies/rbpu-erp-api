const express = require("express");
const router = express.Router();
// const { getProgramsViaFacultyId, getSessionsViaProgramId } = require("../../controllers/admission/studentlist_controller");

const {
  getSessionsViaProgramId,
} = require("../../../controllers/admission/student_list/program_session_controller");

router.get("/sessions-by-program", getSessionsViaProgramId);

module.exports = router;
