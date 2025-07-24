const express = require("express");
const router = express.Router();

const careerCandidateRouter = require("./user_router");
const menusRouter = require("./menus_router");
const facultiesRouter = require("./academic/faculties_router");
const programsRouter = require('./academic/programs_router');
const classroomRouter = require("./academic/classroom_router");
const statustypesRouter = require("./admission/statustypes_router")
const batchesRouter = require("./academic/batches_router");
const studentsRouter = require("./academic/student_routers");

router.use("/api/users", careerCandidateRouter);
router.use("/api/menus", menusRouter);

router.use("/api/faculties",facultiesRouter);
router.use("/api/programs",programsRouter);
router.use("/api/classrooms",classroomRouter);
router.use("/api/statustypes",statustypesRouter)
router.use("/api/batches",batchesRouter);
router.use("/api/students", studentsRouter);


router.get("/api/test", (req, res) => res.send("✅ Working"));

module.exports = router;
