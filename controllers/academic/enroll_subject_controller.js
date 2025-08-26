const { Op } = require("sequelize");
const {
  Subject,
  EnrollSubject,
  Program,
  Semester,
  Section,
  EnrollSubjectSubject,
  ProgramSubject,
} = require("../../models");

module.exports.getEnrollCourses = async (req, res) => {
  const all = req.query.all === "true";
  const page = parseInt(req.query.page, 10) || 1;
  const limit = all ? undefined : parseInt(req.query.limit, 10) || 10;
  const offset = all ? undefined : (page - 1) * limit;

  try {
    const { count, rows } = await EnrollSubject.findAndCountAll({
      attributes: ["id", "program_id", "semester_id", "section_id", "status"],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "title", "slug", "faculty_id"],
        },
        {
          model: Semester,
          as: "semester",
          attributes: ["id", "title", "year"],
        },
        { model: Section, as: "section", attributes: ["id", "title", "seat"] },
        {
          model: Subject,
          attributes: ["id", "title", "code"],
          through: {
            attributes: [
              "enroll_subject_id_pk",
              "enroll_subject_id",
              "subject_id",
            ],
          },
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "ASC"]],
    });

    return res.json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: page,
        limit: limit || "all",
      },
    });
  } catch (error) {
    console.error("Error fetching enroll courses:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching enroll courses" });
  }
};

// ✅ Get single enrolled course by ID
module.exports.getEnrollCourseById = async (req, res) => {
  const { enrollCourseId } = req.params;

  try {
    const enrollCourse = await EnrollSubject.findByPk(enrollCourseId, {
      attributes: ["id", "program_id", "semester_id", "section_id", "status"],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "title", "slug", "faculty_id"],
        },
        {
          model: Semester,
          as: "semester",
          attributes: ["id", "title", "year"],
        },
        { model: Section, as: "section", attributes: ["id", "title", "seat"] },
        {
          model: Subject,
          attributes: ["id", "title", "code"],
          through: {
            attributes: [
              "enroll_subject_id_pk",
              "enroll_subject_id",
              "subject_id",
            ],
          },
        },
      ],
    });

    if (!enrollCourse) {
      return res.status(404).json({ error: "Enroll course not found" });
    }

    return res.json(enrollCourse);
  } catch (error) {
    console.error("Error fetching enroll course:", error);
    res
      .status(500)
      .json({ error: "Server error while fetching enroll course" });
  }
};

module.exports.createEnrollCourse = async (req, res) => {
  const { program_id, semester_id, section_id, subject_ids } = req.body;

  try {
    // 1. Create or find EnrollSubject (one per program/semester/section)
    let enrollSubject = await EnrollSubject.findOne({
      where: { program_id, semester_id, section_id },
      include: [{ model: Subject }],
    });

    if (!enrollSubject) {
      enrollSubject = await EnrollSubject.create({
        program_id,
        semester_id,
        section_id,
        status: true,
      });
    }

    // 2. Get already enrolled subject IDs
    const existingSubjectIds =
      enrollSubject.Subjects?.map((s) => parseInt(s.id)) || [];

    // 3. Filter new vs skipped
    const newSubjectIds = subject_ids.filter(
      (id) => !existingSubjectIds.includes(id)
    );
    const skippedSubjects = subject_ids.filter((id) =>
      existingSubjectIds.includes(id)
    );

    // 4. Insert new ones
    if (newSubjectIds.length > 0) {
      await EnrollSubjectSubject.bulkCreate(
        newSubjectIds.map((sid) => ({
          enroll_subject_id: enrollSubject.id,
          subject_id: sid,
        }))
      );
    }

    // 5. Fetch skipped subject details for message
    let skippedSubjectDetails = [];
    if (skippedSubjects.length > 0) {
      skippedSubjectDetails = await Subject.findAll({
        where: { id: skippedSubjects },
        attributes: ["id", "title", "code"],
      });
    }
    let newSubjectDetails = [];
    if (newSubjectIds.length > 0) {
      newSubjectDetails = await Subject.findAll({
        where: { id: newSubjectIds },
        attributes: ["id", "title", "code"],
      });
    }

    // 6. Reload enrollSubject with updated subjects
    const updatedEnrollSubject = await EnrollSubject.findByPk(
      enrollSubject.id,
      {
        include: [{ model: Subject }],
      }
    );

    const skippedSubjectsTitle =
      skippedSubjectDetails.length > 0 &&
      skippedSubjectDetails.map((s) => s.title);

    const newSubjectsTitle =
      newSubjectDetails.length > 0 && newSubjectDetails.map((s) => s.title);

    return res.status(200).json({
      message: [
        newSubjectsTitle
          ? `${newSubjectsTitle} were added successfully.`
          : "No new subjects were added.",
        skippedSubjectsTitle
          ? ` Already enrolled subjects: ${skippedSubjectsTitle} were skipped!`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      addedSubjects: newSubjectDetails,
      skippedSubjects: skippedSubjectDetails,
      enrollSubject: updatedEnrollSubject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong while creating EnrollSubject",
    });
  }
};

// module.exports.updateEnrollCourse = async (req, res) => {
//   const { enrollCourseId } = req.params;
//   const { program_id, semester_id, section_id, status, subject_ids } = req.body;

//   try {
//     // Step 1: Find enroll_subject by ID
//     const enrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
//       include: [
//         {
//           model: Subject,
//           attributes: ["id", "title", "code"],
//           through: {
//             attributes: [
//               "enroll_subject_id_pk",
//               "enroll_subject_id",
//               "subject_id",
//             ],
//           },
//         },
//       ],
//     });

//     if (!enrollSubject) {
//       return res.status(404).json({ error: "Enroll course not found" });
//     }

//     // Step 2: Update main fields (only if provided, otherwise keep old values)
//     await enrollSubject.update({
//       program_id: program_id ?? enrollSubject.program_id,
//       semester_id: semester_id ?? enrollSubject.semester_id,
//       section_id: section_id ?? enrollSubject.section_id,
//       status: status ?? enrollSubject.status,
//     });

//     // Step 3: Update subjects if array is provided
//     if (Array.isArray(subject_ids)) {
//       await enrollSubject.setSubjects(subject_ids);
//     }

//     // Step 4: Refetch updated record with associations
//     const updatedEnrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
//       include: [
//         {
//           model: Subject,
//           attributes: ["id", "title", "code"], // ✅ only pick the fields you want
//           through: {
//             attributes: [
//               "enroll_subject_id_pk",
//               "enroll_subject_id",
//               "subject_id",
//             ],
//           }, // ✅ include join table
//         },
//       ],
//     });

//     return res.status(200).json({
//       message: "Enroll course updated successfully",
//       enrollSubject: updatedEnrollSubject,
//     });
//   } catch (error) {
//     console.error(error);

//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({ error: "Duplicate entry not allowed" });
//     }

//     res.status(500).json({ error: "Something went wrong" });
//   }
// };


module.exports.updateEnrollCourse = async (req, res) => {
  const { enrollCourseId } = req.params;
  const { status, subject_ids } = req.body;

  try {
    // 1️⃣ Find enroll_subject by ID
    const enrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
      include: [
        {
          model: Subject,
          attributes: ["id", "title", "code"],
          through: { attributes: ["enroll_subject_id_pk", "enroll_subject_id", "subject_id"] },
        },
      ],
    });

    if (!enrollSubject) {
      return res.status(404).json({ error: "Enroll course not found" });
    }

    // 2️⃣ Update only status (if provided)
    if (typeof status !== "undefined") {
      enrollSubject.status = status;
      await enrollSubject.save();
    }

    // 3️⃣ Update subjects (if array is provided → full replace)
    if (Array.isArray(subject_ids)) {
      await enrollSubject.setSubjects(subject_ids);
    }

    // 4️⃣ Refetch updated record with associations
    const updatedEnrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
      include: [
        {
          model: Subject,
          attributes: ["id", "title", "code"],
          through: { attributes: ["enroll_subject_id_pk", "enroll_subject_id", "subject_id"] },
        },
      ],
    });

    return res.status(200).json({
      message: "Enroll course updated successfully",
      enrollSubject: updatedEnrollSubject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while updating Enroll Course" });
  }
};

module.exports.deleteEnrollCourse = async (req, res) => {
  const { enrollCourseId } = req.params;

  try {
    const enrollSubject = await EnrollSubject.findByPk(enrollCourseId);
    if (!enrollSubject) {
      return res.status(404).json({ error: "Enroll course not found" });
    }

    // Step 2: Remove subject associations (only if not using CASCADE)
    await enrollSubject.setSubjects([]); // clears junction table records

    // Step 3: Delete the enroll course
    await enrollSubject.destroy();

    return res.status(200).json({
      message: "Enroll course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting enroll course:", error);
    res.status(500).json({ error: "Something went wrong" });
  }

  // GET /api/programs?faculty_id=1
};

// module.exports.getSubjectsVia_Prog_Sem_Section = async (req, res) => {
//   const { program_id, semester_id, section_id } = req.query;

//   try {
//     if (!program_id || !semester_id || !section_id) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     const enrollSubject = await EnrollSubject.findOne({
//       where: { program_id, semester_id, section_id },
//       include: [
//         {
//           model: Subject,
//           attributes: ["id", "title", "code"],
//           through: {
//             attributes: [
//               // "enroll_subject_id_pk",
//               // "enroll_subject_id",
//               // "subject_id",
//             ],
//           },
//         },
//       ],
//     });

//     if (!enrollSubject) {
//       return res.status(204).json({ error: "Enroll course not found" });
//     }
//     return res.status(200).json(enrollSubject.Subjects);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       error: "Something went  wrong inside getSubjectsVia_Prog_Sem_Section",
//     });
//   }
// };

module.exports.getSubjectsVia_Prog_Sem_Section = async (req, res) => {
  const { program_id } = req.query;

  try {
    if (!program_id) {
      return res
        .status(400)
        .json({ error: "Missing required parameter: program_id" });
    }

    const subjects = await ProgramSubject.findAll({
      where: { program_id },
      include: [
        {
          model: Subject,
          attributes: ["id", "title", "code"],
        },
      ],
    });

    return res.status(200).json(subjects.map((s) => s.Subject));

    // return res.status(200).json(program.Subjects); // all subjects for this program
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Something went wrong inside getSubjectsVia_Prog_Sem_Section",
    });
  }
};
