const { Subject, Program, ProgramSubject } = require("../../models");
const { pgPool } = require("../../pg_constant");
const sequelize = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getCourses: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = all ? null : (page - 1) * limit;

    // Common attributes and includes to avoid duplication
    const subjectAttributes = [
      "id",
      "title",
      "code",
      "credit_hour",
      "subject_type",
      "class_type",
      "total_marks",
      "passing_marks",
      "description",
      "status",
      "created_at",
      "updated_at",
    ];

    const programInclude = {
      model: Program,
      through: { attributes: [] },
      attributes: [
        ["id", "program_id"],
        ["title", "program_title"],
      ],
      required: false,
    };

    // Common formatter function
    const formatSubject = (subject) => {
      const subjectJson = subject.toJSON();
      return {
        ...subjectJson,
        programs:
          subjectJson.Programs?.map((program) => ({
            program_id: program.program_id,
            program_title: program.program_title,
          })) || [],
        // Remove the Programs property to avoid duplication
        Programs: undefined,
      };
    };

    try {
      if (all) {
        // For all courses (no pagination)
        const subjects = await Subject.findAll({
          attributes: subjectAttributes,
          include: [programInclude],
          group: ["Subject.id", "Programs.id"],
          order: [["id", "ASC"]],
          subQuery: false,
        });

        return res.status(200).json({
          data: subjects.map(formatSubject),
        });
      }

      // For paginated courses
      const { count, rows: subjects } = await Subject.findAndCountAll({
        attributes: ["id"],
        order: [["id", "ASC"]],
        limit,
        offset,
        distinct: true,
      });

      if (subjects.length === 0) {
        return res.status(200).json({
          data: [],
          pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            limit,
          },
        });
      }

      const subjectIds = subjects.map((subject) => subject.id);

      const subjectDetails = await Subject.findAll({
        attributes: subjectAttributes,
        include: [programInclude],
        where: { id: subjectIds },
        group: ["Subject.id", "Programs.id"],
        order: [["id", "ASC"]],
        subQuery: false,
      });

      const totalPages = Math.ceil(count / limit);

      return res.status(200).json({
        data: subjectDetails.map(formatSubject),
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return res.status(500).json({
        error: "Server Error While Fetching Subjects",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
  createCourse: async (req, res) => {
    const {
      title,
      code,
      credit_hour,
      subject_type,
      class_type,
      total_marks = null,
      passing_marks = null,
      description = null,
      status = 1,
      program_ids,
    } = req.body;

    if (
      !title ||
      !code ||
      !credit_hour ||
      !subject_type ||
      !class_type ||
      !Array.isArray(program_ids)
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      // Check for duplicate code
      const duplicatecheck = await Subject.findOne({ where: { code } });
      if (duplicatecheck) {
        return res
          .status(409)
          .json({ error: "A subject with the same code already exists." });
      }

      // Create subject
      const newSubject = await Subject.create({
        title,
        code,
        credit_hour,
        subject_type,
        class_type,
        total_marks,
        passing_marks,
        description,
        status,
      });

      await newSubject.addPrograms(program_ids);
      return res.status(201).json({
        message: "Subject created successfully",
        data: {
          subject: newSubject,
          program_ids: program_ids,
        },
      });
    } catch (error) {
      console.error("Error creating subject:", error);
      return res.status(500).json({
        error: "Server Error While Creating Subject",
      });
    }
  },
  updateCourse: async (req, res) => {
    const courseId = req.params.id;
    const {
      title,
      code,
      credit_hour,
      subject_type,
      class_type,
      total_marks = null,
      passing_marks = null,
      description = null,
      status = 1,
      program_ids,
    } = req.body;

    if (
      !title ||
      !code ||
      !credit_hour ||
      !subject_type ||
      !class_type ||
      !Array.isArray(program_ids)
    ) {
      return res
        .status(400)
        .json({
          error: "All required fields must be provided with valid data",
        });
    }

    try {
      const subject = await Subject.findByPk(courseId);
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }

      const duplicateCheck = await Subject.findOne({
        where: {
          code,
          id: { [Op.ne]: courseId },
        },
      });
      if (duplicateCheck) {
        return res
          .status(409)
          .json({ error: "Another subject with the same code already exists" });
      }

      await Subject.update(
        {
          title,
          code,
          credit_hour,
          subject_type,
          class_type,
          total_marks,
          passing_marks,
          description,
          status,
          updated_at: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        {
          where: { id: courseId },
        }
      );

      // Update program associations
      await ProgramSubject.destroy({
        where: {
          subject_id: courseId,
        },
      });

      const insertPromises = program_ids.map((program_id) =>
        ProgramSubject.create({
          subject_id: courseId,
          program_id,
        })
      );
      await Promise.all(insertPromises);

      // // Fetch updated subject with programs to return
      // const updatedSubject = await Subject.findByPk(courseId, {
      //     attributes: [
      //         "id", "title", "code", "credit_hour", "subject_type",
      //         "class_type", "total_marks", "passing_marks",
      //         "description", "status", "created_at", "updated_at"
      //     ],
      //     include: [{
      //         model: Program,
      //         through: { attributes: [] },
      //         attributes: [
      //             ["id", "program_id"],
      //             ["title", "program_title"],
      //         ],
      //         required: false,
      //     }]
      // });

      return res.status(200).json({
        message: "Subject updated successfully",
      });
    } catch (error) {
      console.error("Error updating subject:", error);
      return res.status(500).json({ error: "Error updating subject" });
    }
  },
  deleteCourse: async (req, res) => {
    const subjectId = req.params.id;
    try {
      const subjectCheck = await Subject.findByPk(subjectId);
      if (!subjectCheck) {
        return res.status(404).json({ error: "Subject not found." });
      }
      await ProgramSubject.destroy({
        where: {
          subject_id: subjectId,
        },
      });
      await Subject.destroy({
        where: {
          id: subjectId,
        },
      });
      return res
        .status(200)
        .json({ message: "Subject and its programs deleted successfully." });
    } catch (error) {
      console.error("Error deleting subject:", error);
      return res
        .status(500)
        .json({ error: "Server error while deleting subject." });
    }
  },
};
