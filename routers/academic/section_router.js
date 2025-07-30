const express = require("express");
const router = express.Router()

const {getSections,createSection,updateSection,deleteSection} = require('../../controllers/academic/section_controller')

router.get("/",getSections);
router.post("/",createSection);
router.put("/:sectionId",updateSection);
router.delete("/:sectionId",deleteSection);
module.exports = router;