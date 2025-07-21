const { pgPool } = require("../../pg_constant");
module.exports = {
  getPrograms: async (req, res) => {
    try {
      const query = `
  SELECT 
    programs.id AS program_id,
    programs.title AS program_title,
    faculties.id AS faculty_id,
    faculties.title AS faculty_title,
    programs.slug,
    programs.shortcode,
    programs.registration,
    programs.status,
    programs.created_at,
    programs.updated_at
  FROM programs
  LEFT JOIN faculties ON programs.faculty_id = faculties.id
  ORDER BY programs.id ASC;
`;
      const result = await pgPool.query(query);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching programs:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching programs" });
    }
  },

  createPrograms: async (req, res) => {
    try {
      const { title, shortcode, faculty_id } = req.body;

      const facultyCheck = await pgPool.query(
        "SELECT id FROM faculties WHERE id = $1",
        [faculty_id]
      );

      if (facultyCheck.rows.length === 0) {
        return res.status(400).json({
          message: "Faculty does not exist",
        });
      }
 
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

      const programCheck = await pgPool.query(
        `SELECT id FROM programs 
       WHERE LOWER(title) = LOWER($1) OR slug = $2`,
        [title, slug]
      );

      if (programCheck.rows.length > 0) {
        return res.status(400).json({
          message: "Program with this title or slug already exists",
        });
      }

      const result = await pgPool.query(
        `INSERT INTO programs (
        faculty_id, 
        title, 
        slug, 
        shortcode, 
        registration, 
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
      RETURNING *`,
        [faculty_id, title, slug, shortcode || null, false, true]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating program:", error);
      return res
        .status(500)
        .json({ message: "Server error while creating program" });
    }
  },

  updatePrograms: async (req, res) => {
  const { id } = req.params;
  const { title, shortcode, status, faculty_id } = req.body;

  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    const facultyCheck = await pgPool.query(
      "SELECT id FROM faculties WHERE id = $1",
      [faculty_id]
    );
    if (facultyCheck.rows.length === 0) {
      return res.status(400).json({ message: "Faculty does not exist" });
    }

    const result = await pgPool.query(
      `UPDATE programs  
       SET title = $1, slug = $2, shortcode = $3, status = $4, faculty_id = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, slug, shortcode || null, status, faculty_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Program not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating program:', error);
    return res.status(500).json({ message: 'Server error while updating program' });     
  }
},


  deleteProgram: async(req,res)=>{
    const {id} = req.params;
    try {
      const result = await pgPool.query(
      `DELETE FROM programs
      WHERE id = $1
      RETURNING *;`,
      [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Program not found" });
      }
       res.status(200).json({ message: "Program deleted successfully" });

    } catch (error) {
      console.error('Error deleting program:', error);
      res.status(500).json({ message: 'Server error while deleting program' });
    }
  }

};
