const express = require("express");
const dropdownRouter = express.Router();
const {
  getBatchesDropdown,
  getProgramsDropdown,
  getSessionDropdown,
  getSemesterDropdown,
  getSectionDropdown,
<<<<<<< HEAD
  getFacultyDropdown,
=======
  getStatusTypesDropdown,
>>>>>>> f4453f6ef78a351547cd38031abfd6978f5e5141
} = require("../../controllers/common/dropdown_controller");
const { getStatusTypes } = require("../../controllers/admission/statustypes_controller");

dropdownRouter.get("/batches", getBatchesDropdown);
dropdownRouter.get("/programs", getProgramsDropdown);
dropdownRouter.get("/sessions", getSessionDropdown);
dropdownRouter.get("/semesters", getSemesterDropdown);
dropdownRouter.get("/sections", getSectionDropdown);
<<<<<<< HEAD
dropdownRouter.get("/faculties", getFacultyDropdown);
=======
dropdownRouter.get("/status_types", getStatusTypesDropdown);
>>>>>>> f4453f6ef78a351547cd38031abfd6978f5e5141

module.exports = dropdownRouter;
