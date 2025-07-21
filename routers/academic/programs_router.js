const express = require("express");
const router = express.Router()
const {getPrograms} = require('../../controllers/academic/programs_controller')

router.get("/",getPrograms);
module.exports = router;