const { pgPool } = require("../../pg_constant");

module.exports = {

  getStatusTypes: async (req, res) => {
    try {
      const query = `SELECT id, title, slug, description, status FROM status_types ORDER BY id ASC;`;
      const result = await pgPool.query(query);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching status types:', error);
      return res.status(500).json({ message: 'Server error while fetching status types' });
    }
  },

  createStatusType: async (req, res) => {
    const { title, description } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    try {
      const checkQuery = `
        SELECT * FROM status_types 
        WHERE LOWER(title) = LOWER($1) OR slug = $2;
      `;
      const checkValues = [title, slug];
      const checkResult = await pgPool.query(checkQuery, checkValues);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ message: 'Status type with this title or slug already exists' });
      }

      const insertQuery = `
        INSERT INTO status_types (title, slug, description, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
      `;
      const insertValues = [title, slug, description || null, true ];
      const result = await pgPool.query(insertQuery, insertValues);

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating status type:', err);
      res.status(500).json({ message: 'Server error while creating status type' });
    }
  },

  updateStatusType: async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    try {
      const query = `
        UPDATE status_types
        SET title = $1, slug = $2, description = $3, status = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `;
      const values = [title, slug, description || null, status, id];
      const result = await pgPool.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Status type not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating status type:', err);
      res.status(500).json({ message: 'Server error while updating status type' });
    }
  },

  deleteStatusType: async (req, res) => {
    const { id } = req.params;

    try {
      const query = `
        DELETE FROM status_types
        WHERE id = $1
        RETURNING *;
      `;
      const result = await pgPool.query(query, [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Status type not found' });
      }

      res.status(200).json({ message: 'Status type deleted successfully' });
    } catch (err) {
      console.error('Error deleting status type:', err);
      res.status(500).json({ message: 'Server error while deleting status type' });
    }
  }

};
