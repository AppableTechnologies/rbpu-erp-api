// const express = require("express");
// const router = express.Router();

// const careerCandidateRouter = require("./user_router");
// const menusRouter = require("./common/menus_router");
// const facultiesRouter = require("./academic/faculties_router");
// const programsRouter = require("./academic/programs_router");
// const classroomRouter = require("./academic/classroom_router");
// const statustypesRouter = require("./admission/statustypes_router")
// const batchesRouter = require("./academic/batches_router");
// const studentsRouter = require("./admission/student_registration_routers");
// const sessionRouter = require("./academic/session_router");
// const dropdownRouter = require("./common/dropdown_router");
// const  SemesterRouter  = require("./academic/Semesters_routes");
// const SectionRouter = require("./academic/section_router");
// const studentlistRouter = require('./admission/studentlist_router')

// router.use("/api/users", careerCandidateRouter);
// router.use("/api/menus", menusRouter);

// router.use("/api/faculties",facultiesRouter);
// router.use("/api/programs",programsRouter);
// router.use("/api/classrooms",classroomRouter);
// router.use("/api/statustypes",statustypesRouter)
// router.use("/api/batches",batchesRouter);
// router.use("/api/students", studentsRouter);
// router.use("/api/students_list", studentlistRouter);
// router.use("/api/sessions", sessionRouter);
// router.use("/api/common/dropdown", dropdownRouter);
// router.use("/api/semesters", SemesterRouter);
// router.use("/api/sections", SectionRouter);

// module.exports = router;



const express = require("express");
const router = express.Router();
const careerCandidateRouter = require("./user_router");
const menusRouter = require("./common/menus_router");
const facultiesRouter = require("./academic/faculties_router");
const programsRouter = require("./academic/programs_router");
const classroomRouter = require("./academic/classroom_router");
const statustypesRouter = require("./admission/statustypes_router")
const batchesRouter = require("./academic/batches_router");
const studentsRouter = require("./admission/student_registration_routers");
const sessionRouter = require("./academic/session_router");
const dropdownRouter = require("./common/dropdown_router");
const  SemesterRouter  = require("./academic/Semesters_routes");
const SectionRouter = require("./academic/section_router");
const studentlistRouter = require('./admission/student_list/index_router')
const SubjectRouter = require("./academic/subject_routes");
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
router.use("/api/semesters", SemesterRouter);
router.use("/api/sections", SectionRouter);
router.use("/api/subjects", SubjectRouter);
module.exports = router;