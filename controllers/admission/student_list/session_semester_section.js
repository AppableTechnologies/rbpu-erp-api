const { Program, Session, Semester } = require("../../../models");

const getSemestersViaSessionId = async (req, res) => {
  const { session_id } = req.query;
  try {
    if (!session_id) {
      return res.status(400).json({ message: "Missing session_id in query." });
    }
    const semester = await Program.findByPk(session_id, {
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

module.exports = {
  getSemestersViaSessionId,
};