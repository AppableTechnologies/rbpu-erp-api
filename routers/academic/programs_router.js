const express = require("express");
const router = express.Router()
const {getPrograms,createPrograms,updatePrograms,deleteProgram} = require('../../controllers/academic/programs_controller')

router.get("/",getPrograms);
router.post("/",createPrograms);
router.put("/:id",updatePrograms);
router.delete("/:id",deleteProgram);
module.exports = router;