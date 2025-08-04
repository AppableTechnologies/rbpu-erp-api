const express = require("express");
const router = express.Router();

const careerCandidateRouter = require("./user_router");
const menusRouter = require("./menus_router");
const facultiesRouter = require("./academic/faculties_router");
const programsRouter = require("./academic/programs_router");
const classroomRouter = require("./academic/classroom_router");
const statustypesRouter = require("./admission/statustypes_router")
const batchesRouter = require("./academic/batches_router");
const studentsRouter = require("./admission/student_registration_routers");
const sessionRouter = require("./academic/session_router");
const dropdownRouter = require("./common/dropdown_router");
const  getSemester  = require("./academic/Semesters_routes");
const getSections = require("./academic/section_router");
const studentlistRouter = require('./admission/studentlist_router')

router.use("/api/users", careerCandidateRouter);
router.use("/api/menus", menusRouter);

router.use("/api/faculties",facultiesRouter);
router.use("/api/programs",programsRouter);
router.use("/api/classrooms",classroomRouter);
router.use("/api/statustypes",statustypesRouter)
router.use("/api/batches",batchesRouter);
router.use("/api/students", studentsRouter);
router.use("/api/students_list", studentlistRouter);
router.use("/api/sessions", sessionRouter);
router.use("/api/common/dropdown", dropdownRouter);
router.use("/api/semesters", getSemester);
router.use("/api/sections", getSections);


router.get("/api/test", (req, res) => res.send("✅ Working"));

module.exports = router;
