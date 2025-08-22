const { Program, Session, Semester, Section, ProgramSemesterSection } = require("../../../models");

const getSemestersViaProgramId = async (req, res) => {
  const { program_id } = req.query;
  try {
    if (!program_id) {
      return res.status(400).json({ message: "Missing session_id in query." });
    }
    const semester = await Program.findByPk(program_id, {
      include: [
        {
          model: Semester,
          attributes: ["id", "title"],
          through: { attributes: [] }, // skip join table details
        },
      ],
      order: [[Semester, "id", "ASC"]],
    });
    if (!semester) {
      return res.status(404).json({ message: "Semester not found." });
    }
    res.status(200).json(semester.Semesters);
  } catch (error) {
    console.error("Error fetching semesters by session:", error);
    res.status(500).json({ message: "Error fetching semester." });
  }
};
const getSemestersBySession = async (req, res) => {
  const { program_id, session_id } = req.query;
  if (!program_id || !session_id) {
    return res.status(400).json({ message: "Missing program_id or session_id" });
  }

  try {
    // Assuming you have a join table ProgramSemesterSection
    const semesters = await Semester.findAll({
      include: [
        {
          model: ProgramSemesterSection,
          where: { program_id, session_id },
          attributes: [],
        },
      ],
      attributes: ["id", "title"],
      order: [["id", "ASC"]],
    });

    res.status(200).json({ data: semesters });
  } catch (error) {
    console.error("Error fetching semesters by session:", error);
    res.status(500).json({ message: "Error fetching semesters" });
  }
};

const getSectionsViaSemesterId = async (req, res) => {
  const { semester_id } = req.query;

  try {
    if (!semester_id) {
      return res.status(400).json({ message: "Missing semester_id in query." });
    }

    const semester = await Semester.findByPk(semester_id, {
      include: [
        {
          model: Section,
          attributes: ["id", "title"],
          through: { attributes: [] }, // skip join table fields
        },
      ],
      order: [[Section, "id", "ASC"]],
    });

    if (!semester) {
      return res.status(404).json({ message: "Semester not found." });
    }

    res.status(200).json(semester.Sections);
  } catch (error) {
    console.error("Error fetching sections by semesterID:", error);
    res.status(500).json({ message: "Error fetching sections." });
  }
};

module.exports = {
  getSemestersViaProgramId,
  getSectionsViaSemesterId
};
