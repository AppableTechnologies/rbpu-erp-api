const { Student, Faculty, Program, Session, Semester, Section } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  // Fetch students with optional filters
  getStudents: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        faculty_id,
        program_id,
        session_id,
        semester_id,
        section_id,
        status,
        search,
      } = req.query;

      const offset = (page - 1) * limit;

      // Build where condition
      const where = {};

      if (faculty_id) where.faculty_id = faculty_id;
      if (program_id) where.program_id = program_id;
      if (session_id) where.session_id = session_id;
      if (semester_id) where.semester_id = semester_id;
      if (section_id) where.section_id = section_id;
      if (status) where.status = status; // assuming status is boolean or int 0/1

      if (search) {
        where[Op.or] = [
          { student_id: { [Op.iLike]: `%${search}%` } },
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: students } = await Student.findAndCountAll({
        where,
        include: [
          { model: Faculty, attributes: ["id", "title"] },
          { model: Program, attributes: ["id", "title"] },
          { model: Session, attributes: ["id", "title"] },
          { model: Semester, attributes: ["id", "title"] },
          { model: Section, attributes: ["id", "title"] },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        data: students,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Failed to fetch students" });
    }
  },
};
