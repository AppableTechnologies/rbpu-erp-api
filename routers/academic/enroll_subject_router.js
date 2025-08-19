const exporess = require("express");
const router = exporess.Router();
const {
  getEnrollSubjects,
  createEnrollCourse,
  updateEnrollCourse,
  deleteEnrollCourse,
  getEnrollCourses,
  getEnrollCourseById,
} = require("../../controllers/academic/enroll_subject_controller");

router.get("/", getEnrollCourses);
router.get("/by-id/:enrollCourseId", getEnrollCourseById);
router.post("/create", createEnrollCourse);
router.put("/:enrollCourseId", updateEnrollCourse);
router.delete("/:enrollCourseId", deleteEnrollCourse);

module.exports = router;
