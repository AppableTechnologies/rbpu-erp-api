const exporess = require("express");
const router = exporess.Router();
const {
  getEnrollSubjects,
} = require("../../controllers/academic/enroll_subject_controller");

router.get("/", getEnrollSubjects);

module.exports = router;
