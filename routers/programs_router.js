const express = require("express");
const router = express.Router()
const {getPrograms} = require('../controllers/programs_controller')

router.get("/",getPrograms);
module.exports = router;