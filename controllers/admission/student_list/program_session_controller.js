const { Program, Session } = require("../../../models");

const getSessionsViaProgramId = async (req, res) => {
  const { program_id } = req.query;
  try {
    if (!program_id) {
      return res.status(400).json({ message: "Missing program_id in query." });
    }
    const program = await Program.findByPk(program_id, {
      include: [
        {
          model: Session,
          attributes: ["id", "title"],
          through: { attributes: [] }, // skip join table details
        },
      ],
      order: [[Session, "id", "ASC"]],
    });
    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }
    res.status(200).json(program.Sessions);
  } catch (error) {
    console.error("Error fetching sessions by program:", error);
    res.status(500).json({ message: "Error fetching sessions." });
  }
};

module.exports = {
  getSessionsViaProgramId,
};