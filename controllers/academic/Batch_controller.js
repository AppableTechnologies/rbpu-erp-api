const { pgPool } = require("../../pg_constant");

module.exports = {
  getBatches: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    try {
      let dataQuery, dataParams;

      if (all) {
        dataQuery = `
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
        ORDER BY bt.id ASC;
      `;
        dataParams = [];
      } else {
        dataQuery = `
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
        ORDER BY bt.id ASC
        LIMIT $1 OFFSET $2;
      `;
        dataParams = [limit, offset];
      }

      const dataResult = await pgPool.query(dataQuery, dataParams);

      if (all) {
        return res.status(200).json({ data: dataResult.rows });
      }

      // Count total batches (for pagination)
      const countQuery = `SELECT COUNT(*) FROM batches;`;
      const countResult = await pgPool.query(countQuery);
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        data: dataResult.rows,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching batches:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching batches" });
    }
  },
  createBatch: async (req, res) => {
    const { title, start_date, program_ids, status = true } = req.body;

    if (
      !title ||
      !start_date ||
      !Array.isArray(program_ids) ||
      program_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or empty program list." });
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

      const insertBatches = await pgPool.query(
        `INSERT INTO batches (title, start_date, status, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [title, start_date, status]
      );

      const batch = insertBatches.rows[0];
      const batch_id = batch.id;

      // Insert all program links
      const programInsertPromises = program_ids.map((pid) =>
        pgPool.query(
          `INSERT INTO batch_program (batch_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
         RETURNING *`,
          [batch_id, pid]
        )
      );

      await Promise.all(programInsertPromises);

      return res.status(201).json({
        message: "Batch created successfully with assigned programs",
        batch,
      });
    } catch (error) {
      console.error("Error creating batch:", error);
      return res
        .status(500)
        .json({ message: "Server error while creating batch" });
    }
  },
  updateBatch: async (req, res) => {
    const batchId = req.params.id;
    const { title, start_date, program_ids, status } = req.body;

    if (
      !title ||
      !start_date ||
      !Array.isArray(program_ids) ||
      program_ids.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or empty program list." });
    }

    try {
      const batchCheck = await pgPool.query(
        "SELECT * FROM batches WHERE id = $1",
        [batchId]
      );
      if (batchCheck.rowCount === 0) {
        return res.status(404).json({ error: "Batch not found." });
      }

      await pgPool.query(
        `UPDATE batches 
       SET title = $1, start_date = $2, status = $3, updated_at = NOW() 
       WHERE id = $4`,
        [title, start_date, status, batchId]
      );

      // Delete existing program links
      await pgPool.query("DELETE FROM batch_program WHERE batch_id = $1", [
        batchId,
      ]);

      // Insert new program links
      const insertPromises = program_ids.map((pid) =>
        pgPool.query(
          `INSERT INTO batch_program (batch_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [batchId, pid]
        )
      );
      await Promise.all(insertPromises);

      return res.status(200).json({ message: "Batch updated successfully." });
    } catch (error) {
      console.error("Error updating batch:", error);
      return res
        .status(500)
        .json({ message: "Server error while updating batch" });
    }
  },
  deleteBatch: async (req, res) => {
    const batchId = req.params.id;

    try {
      const batchCheck = await pgPool.query(
        "SELECT * FROM batches WHERE id = $1",
        [batchId]
      );
      if (batchCheck.rowCount === 0) {
        return res.status(404).json({ error: "Batch not found." });
      }

      await pgPool.query("DELETE FROM batch_program WHERE batch_id = $1", [
        batchId,
      ]);

      await pgPool.query("DELETE FROM batches WHERE id = $1", [batchId]);

      return res.status(200).json({
        message: "Batch and associated programs deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting batch:", error);
      return res
        .status(500)
        .json({ message: "Server error while deleting batch" });
    }
  },
};
