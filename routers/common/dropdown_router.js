const express = require("express");
const dropdownRouter = express.Router();
const {
  getBatchesDropdown,
  getProgramsDropdown,
  getSessionDropdown,
  getSemesterDropdown,
  getSectionDropdown,
  getFacultyDropdown,
  getStatusTypesDropdown,
} = require("../../controllers/common/dropdown_controller");
<<<<<<< HEAD
// const { getStatusTypes } = require("../../controllers/admission/statustypes_controller");
=======
>>>>>>> 090b4e683a54ee278631fb97f8614a08adae51ca

dropdownRouter.get("/batches", getBatchesDropdown);
dropdownRouter.get("/programs", getProgramsDropdown);
dropdownRouter.get("/sessions", getSessionDropdown);
dropdownRouter.get("/semesters", getSemesterDropdown);
dropdownRouter.get("/sections", getSectionDropdown);
dropdownRouter.get("/faculties", getFacultyDropdown);
dropdownRouter.get("/status_types", getStatusTypesDropdown);


module.exports = dropdownRouter;
