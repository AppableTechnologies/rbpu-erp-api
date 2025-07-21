const express = require("express");
const router = express.Router();
const careerCandidateRouter = require("./user_router");
const menusRouter = require("./menus_router");
const facultiesRouter = require("./academic/faculties_router");
const programsRouter = require('./academic/programs_router');
router.use("/api/users", careerCandidateRouter);
router.use("/api/menus", menusRouter);

router.use("/api/faculties",facultiesRouter);
router.use("/api/programs",programsRouter);

router.get("/api/test", (req, res) => res.send("✅ Working"));


module.exports = router;
