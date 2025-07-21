const { pgPool } = require("../../pg_constant");
module.exports = {
  getPrograms: async (req, res) => {
    try {
      const query = `SELECT id, faculty_id,title,slug,shortcode
      ,registration,status FROM programs ORDER BY id ASC;`;
      const result = await pgPool.query(query)
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching programs:', error);
      return res.status(500).json({ message: 'Server error while fetching programs' });
    }
  },
};
