const express = require("express");
const router = express.Router();
const { getFaculties,createFaculty,updateFaculty,deleteFaculty } = require("../controllers/faculties_controller");

router.get("/", getFaculties);

router.post("/", createFaculty);

router.put("/:id", updateFaculty);

router.delete("/:id", deleteFaculty);

module.exports = router;
