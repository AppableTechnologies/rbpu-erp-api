const express = require("express");
const router = express.Router();
const { upload } = require("../../middlewares/multer");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentDocuments,
} = require("../../controllers/admission/student_registration_controller");

router.get("/", getStudents);
router.post(
  "/create",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    // { name: "school_transcript", maxCount: 1 },
    // { name: "school_certificate", maxCount: 1 },
    // { name: "collage_transcript", maxCount: 1 },
    // { name: "collage_certificate", maxCount: 1 },
    // { name: "father_photo", maxCount: 1 },
    // { name: "mother_photo", maxCount: 1 },
  ]),
  createStudent 
);
router.put("/update/:id", updateStudent);
router.delete("/delete/:id", deleteStudent);


module.exports = router;