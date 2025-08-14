const exporess = require("express");
const router = exporess.Router();
const {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
} = require("../../controllers/academic/subjects_controller");
router.get("/", getCourses);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
module.exports = router;