const {pgPool} = require("../pg_constant");

module.exports = {

getFaculties:async(req,res)=>{
    try {
        const query = `SELECT id,title,slug,shortcode, status FROM faculties ORDER BY id ASC;`;
        const result = await pgPool.query(query);
        return res.status(200).json(result.rows);
        
    } catch (error) {
        console.error('Error fetching faculties:', error);
        return res.status(500).json({ message: 'Server error while fetching faculties' });
    }
}
,


createFaculty: async (req, res) => {
  const { title, shortcode} = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


  try {
    // 1. Check if title or slug already exists
    const checkQuery = `
      SELECT * FROM faculties 
      WHERE LOWER(title) = LOWER($1) OR slug = $2;
    `;
    const checkValues = [title, slug];
    const checkResult = await pgPool.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Faculty with this title or slug already exists' });
    }

    // 2. Insert new faculty if no duplicates
    const insertQuery = `
      INSERT INTO faculties (title, slug, shortcode, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *;
    `;
    const insertValues = [title, slug, shortcode || null, true];
    const result = await pgPool.query(insertQuery, insertValues);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating faculty:', err);
    res.status(500).json({ message: 'Server error while creating faculty' });
  }
}

,

  updateFaculty: async (req, res) => {
    const { id } = req.params;
    const { title, shortcode, status } = req.body;
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    
    try {
      const query = `
        UPDATE faculties
        SET title = $1, slug = $2, shortcode = $3, status = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `;
      const values = [title, slug, shortcode || null, status, id];
      const result = await pgPool.query(query, values);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating faculty:', err);
      res.status(500).json({ message: 'Server error while updating faculty' });
    }
  },

  deleteFaculty: async (req, res) => {
    const { id } = req.params;
    
    try {
      const query = `
        DELETE FROM faculties
        WHERE id = $1
        RETURNING *;
      `;
      const result = await pgPool.query(query, [id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      
      res.status(200).json({ message: 'Faculty deleted successfully' });
    } catch (err) {
      console.error('Error deleting faculty:', err);
      res.status(500).json({ message: 'Server error while deleting faculty' });
    }
  },


};



