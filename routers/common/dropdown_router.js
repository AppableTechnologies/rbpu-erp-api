const express = require("express");
const dropdownRouter = express.Router();
const {
  getBatchesDropdown,
  getProgramsDropdown,
  getSessionDropdown,
  getSemesterDropdown,
  getSectionDropdown,
} = require("../../controllers/common/dropdown_controller");

dropdownRouter.get("/batches", getBatchesDropdown);
dropdownRouter.get("/programs", getProgramsDropdown);
dropdownRouter.get("/sessions", getSessionDropdown);
dropdownRouter.get("/semesters", getSemesterDropdown);
dropdownRouter.get("/sections", getSectionDropdown);

module.exports = dropdownRouter;
