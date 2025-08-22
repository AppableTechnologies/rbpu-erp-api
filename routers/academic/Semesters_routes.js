const express = require("express");
const router = express.Router()
const {getSemester, createSemester,updateSemester,deleteSemester} = require('../../controllers/academic/Semesters_controller')

router.get("/",getSemester);
router.post("/",createSemester);
router.put("/:id",updateSemester);
router.delete("/:id",deleteSemester);

module.exports = router;