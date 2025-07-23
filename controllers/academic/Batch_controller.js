const { pgPool } = require("../../pg_constant");

module.exports = {
  getBatches: async (req, res) => {
    try {
      const result = await pgPool.query(`
                SELECT 
                bt.id AS batch_id,
                bt.title AS batches_title, 
                bt.start_date,
                bt.status,
                bt.created_at,
                bt.updated_at,
                bp.program_id,
                p.title AS program_title
                FROM batches bt
                LEFT JOIN batch_program bp ON bt.id = bp.batch_id
                LEFT JOIN programs p ON bp.program_id = p.id
                ORDER BY bt.id ASC;`);
      return res.status(200).json({ data: result.rows });
    } catch (error) {
      console.error("Error fetching batches:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching batches" });
    }
  },
  createBatch: async (req, res) => {
    const { title, start_date, program_id, status = true } = req.body;

    if (!title || !start_date || program_id == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Duplicate batch check
      const duplicateCheck = await pgPool.query(
        "SELECT id FROM batches WHERE title = $1 AND start_date = $2",
        [title, start_date]
      );

      if (duplicateCheck.rowCount > 0) {
        return res.status(409).json({
          error: "A batch with the same title and start date already exists.",
        });
      }

      // Insert batch
      const insertBatches = await pgPool.query(
        `INSERT INTO batches (title, start_date, status, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [title, start_date, status]
      );

      const batch = insertBatches.rows[0];
      const batch_id = batch.id;

      // Insert link to program
      const insertBatchedProgram = await pgPool.query(
        `INSERT INTO batch_program (batch_id, program_id) 
       VALUES ($1, $2) RETURNING *`,
        [batch_id, program_id]
      );

      return res.status(201).json({
        message: "Batch created successfully",
        batch,
        batch_program: insertBatchedProgram.rows[0],
      });
    } catch (error) {
      console.error("Error creating batch:", error);
      return res
        .status(500)
        .json({ message: "Server error while creating batch" });
    }
  },
};
