const { pgPool } = require("../../pg_constant");
// const {}
const { Op } = require("sequelize");
const { Batch, Program, BatchProgram } = require("../../models");

module.exports = {
getBatches: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    try {
        if (all) {
            // For all batches (no pagination)
            const batches = await Batch.findAll({
                attributes: [
                    'id',
                    ['title', 'batches_title'],
                    'start_date',
                    'status',
                    'created_at',
                    'updated_at'
                ],
                include: [{
                    model: Program,
                    through: { attributes: [] }, // Exclude join table attributes
                    attributes: [
                        ['id', 'program_id'],
                        ['title', 'program_title']
                    ],
                    required: false // LEFT JOIN
                }],
                group: ['Batch.id', 'Programs.id'], // Needed for aggregation
                order: [['id', 'ASC']],
                subQuery: false
            });

            // Format the response to match the original SQL output
            const formattedBatches = batches.map(batch => {
                const batchJson = batch.toJSON();
                return {
                    batch_id: batchJson.id,
                    batches_title: batchJson.batches_title,
                    start_date: batchJson.start_date,
                    status: batchJson.status,
                    created_at: batchJson.created_at,
                    updated_at: batchJson.updated_at,
                    programs: batchJson.Programs ? batchJson.Programs.map(program => ({
                        program_id: program.program_id,
                        program_title: program.program_title
                    })) : []
                };
            });

            return res.status(200).json({ data: formattedBatches });
        } else {
            // For paginated batches
            const { count, rows: batches } = await Batch.findAndCountAll({
                attributes: ['id'],
                order: [['id', 'ASC']],
                limit,
                offset,
                distinct: true // Correct count when using includes
            });

            if (batches.length === 0) {
                return res.status(200).json({
                    data: [],
                    pagination: {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page,
                        limit
                    }
                });
            }

            const batchIds = batches.map(batch => batch.id);

            const batchDetails = await Batch.findAll({
                attributes: [
                    'id',
                    ['title', 'batches_title'],
                    'start_date',
                    'status',
                    'created_at',
                    'updated_at'
                ],
                include: [{
                    model: Program,
                    through: { attributes: [] },
                    attributes: [
                        ['id', 'program_id'],
                        ['title', 'program_title']
                    ],
                    required: false
                }],
                where: {
                    id: batchIds
                },
                group: ['Batch.id', 'Programs.id'],
                order: [['id', 'ASC']],
                subQuery: false
            });

            // Format the response
            const formattedBatches = batchDetails.map(batch => {
                const batchJson = batch.toJSON();
                return {
                    batch_id: batchJson.id,
                    batches_title: batchJson.batches_title,
                    start_date: batchJson.start_date,
                    status: batchJson.status,
                    created_at: batchJson.created_at,
                    updated_at: batchJson.updated_at,
                    programs: batchJson.Programs ? batchJson.Programs.map(program => ({
                        program_id: program.program_id,
                        program_title: program.program_title
                    })) : []
                };
            });

            const totalItems = count;
            const totalPages = Math.ceil(totalItems / limit);

            return res.status(200).json({
                data: formattedBatches,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            });``
        }
    } catch (error) {
        console.error("Error fetching batches:", error);
        return res.status(500).json({ message: "Server error while fetching batches" });
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
      // const duplicateCheck = await pgPool.query(
      //   "SELECT id FROM batches WHERE title = $1 AND start_date = $2",
      //   [title, start_date]
      // );

      // if (duplicateCheck.rowCount > 0) {
      //   return res.status(409).json({
      //     error: "A batch with the same title and start date already exists.",
      //   });
      // }
      const duplicateCheck = await Batch.findOne({
        where: {
          title: title,
          start_date: start_date,
        },
      })
      if (duplicateCheck) {
        return res.status(409).json({
          error: "A batch with the same title and start date already exists.",
        });
        
      }

      // const insertBatches = await pgPool.query(
      //   `INSERT INTO batches (title, start_date, status, created_at, updated_at) 
      //  VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      //   [title, start_date, status]
      // );

      const insertBatches = await Batch.create({
        title,
        start_date,
        status,
      })

      const batch = insertBatches;
      const batch_id = batch.id;

      // Insert all program links
      // const programInsertPromises = program_ids.map((pid) =>
      //   pgPool.query(
      //     `INSERT INTO batch_program (batch_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
      //    RETURNING *`,
      //     [batch_id, pid]
      //   )
      // );

      const programInsertPromises = program_ids.map((pid) =>
        BatchProgram.create({
          batch_id,
          program_id: pid,
        })
      );

      await Promise.all(programInsertPromises);

      res.status(201).json({
        message: "Batch created successfully",
        batch,
      });
    }catch (err) {
      console.error("Error creating batch:", err);
      res.status(500).json({ message: "Server error while creating batch" });
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
      
      const checkBatch = await Batch.findOne({
        where: {
          id: batchId,
        },
      });
      if (!checkBatch) {
        return res.status(404).json({ error: "Batch not found." });
      }

      // await pgPool.query(
      //   `UPDATE batches 
      //  SET title = $1, start_date = $2, status = $3, updated_at = NOW() 
      //  WHERE id = $4`,
      //   [title, start_date, status, batchId]
      // );

      await Batch.update(
        {
          title,
          start_date,
          status,
        },
        {
          where: {
            id: batchId,
          },
        }
      );
      // Delete existing program links
      // await pgPool.query("DELETE FROM batch_program WHERE batch_id = $1", [
      //   batchId,
      // ]);

      await BatchProgram.destroy({
        where: {
          batch_id: batchId,
        },
      });

      // Insert new program links
      // const insertPromises = program_ids.map((pid) =>
      //   pgPool.query(
      //     `INSERT INTO batch_program (batch_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      //     [batchId, pid]
      //   )
      // );

      const insertPromises = program_ids.map((pid) =>
        BatchProgram.create({
          batch_id: batchId,
          program_id: pid,
        })
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
       const checkBatch = await Batch.findOne({
        where: {
          id: batchId,
        },
      });
      if (!checkBatch) {
        return res.status(404).json({ error: "Batch not found." });
      }

      // await pgPool.query("DELETE FROM batch_program WHERE batch_id = $1", [
      //   batchId,
      // ]);

      await BatchProgram.destroy({
        where: {
          batch_id: batchId,
        },
      });

      // await pgPool.query("DELETE FROM batches WHERE id = $1", [batchId]);

      await Batch.destroy({
        where: {
          id: batchId,
        },
      });

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
