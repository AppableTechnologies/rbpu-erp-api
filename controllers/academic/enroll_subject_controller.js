const { Op } = require("sequelize");
const {
  Subject,
  EnrollSubject,
  Program,
  Semester,
  Section,
  EnrollSubjectSubject,
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
  const {
    program_id,
    semester_id,
    section_id,
    status = true,
    subject_ids,
  } = req.body;

  if (
    !program_id ||
    !semester_id ||
    !section_id ||
    !Array.isArray(subject_ids)
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Step 1: Check if already exists
    const existing = await EnrollSubject.findOne({
      where: { program_id, semester_id, section_id },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "This course is already enrolled." });
    }

    // Step 2: Create enroll_subject record
    const enrollSubject = await EnrollSubject.create({
      program_id,
      semester_id,
      section_id,
      status,
    });

    // Step 3: Attach subjects
    await enrollSubject.addSubjects(subject_ids);

    res.status(201).json({
      message: "Enroll course created successfully",
      enrollSubject,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Duplicate entry not allowed" });
    }

    res.status(500).json({ error: "Something went wrong" });
  }
};

// controllers/enrollCourseController.js

module.exports.updateEnrollCourse = async (req, res) => {
  const { enrollCourseId } = req.params;
  const { program_id, semester_id, section_id, status, subject_ids } = req.body;

  try {
    // Step 1: Find enroll_subject by ID
    const enrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
      include: [
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

    if (!enrollSubject) {
      return res.status(404).json({ error: "Enroll course not found" });
    }

    // Step 2: Update main fields (only if provided, otherwise keep old values)
    await enrollSubject.update({
      program_id: program_id ?? enrollSubject.program_id,
      semester_id: semester_id ?? enrollSubject.semester_id,
      section_id: section_id ?? enrollSubject.section_id,
      status: status ?? enrollSubject.status,
    });

    // Step 3: Update subjects if array is provided
    if (Array.isArray(subject_ids)) {
      await enrollSubject.setSubjects(subject_ids);
    }

    // Step 4: Refetch updated record with associations
    const updatedEnrollSubject = await EnrollSubject.findByPk(enrollCourseId, {
      include: [
        {
          model: Subject,
          attributes: ["id", "title", "code"], // ✅ only pick the fields you want
          through: {
            attributes: [
              "enroll_subject_id_pk",
              "enroll_subject_id",
              "subject_id",
            ],
          }, // ✅ include join table
        },
      ],
    });

    return res.status(200).json({
      message: "Enroll course updated successfully",
      enrollSubject: updatedEnrollSubject,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Duplicate entry not allowed" });
    }

    res.status(500).json({ error: "Something went wrong" });
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
};
