const exporess = require("express");
const router = exporess.Router();
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getFilteredSubjects,
} = require("../../controllers/academic/subjects_controller");
router.get("/", getCourses);
router.post("/", createCourse);
router.get("/filtered", getFilteredSubjects);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
module.exports = router;