const exporess = require("express");
const router = exporess.Router();
const {
  getEnrollSubjects,
  createEnrollCourse,
  updateEnrollCourse,
  deleteEnrollCourse,
  getEnrollCourses,
  getEnrollCourseById,
  getProgramsByFaculty,
  getSubjectsVia_Prog_Sem_Section,
} = require("../../controllers/academic/enroll_subject_controller");

router.get("/", getEnrollCourses);
router.get("/by-id/:enrollCourseId", getEnrollCourseById);
router.post("/create", createEnrollCourse);
router.put("/:enrollCourseId", updateEnrollCourse);
router.delete("/:enrollCourseId", deleteEnrollCourse);
router.get("/subjects-by-prog-sem-sec", getSubjectsVia_Prog_Sem_Section);

module.exports = router;
