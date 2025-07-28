const { pgPool } = require("../../pg_constant");

module.exports = {
  getSemester: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);
    try {
      if (all) {
        const dataQuery = `
                SELECT 
                    st.id AS semester_id,
                    st.title AS semester_title, 
                    st.year,
                    st.status,
                    st.created_at,
                    st.updated_at,
                    json_agg(
                        json_build_object(
                            'program_id', p.id,
                            'program_title', p.title
                        )
                    ) AS programs
                FROM semesters st
                LEFT JOIN program_semester ps ON st.id = ps.semester_id
                LEFT JOIN programs p ON ps.program_id = p.id
                GROUP BY st.id
                ORDER BY st.id ASC;`;

        const dataResult = await pgPool.query(dataQuery);
        return res.status(200).json({ data: dataResult.rows });
      } else {
        // For paginated semsters
        // First get the semesters IDs for the current page
        const semesterIdsQuery = `
                SELECT id FROM semesters
                ORDER BY id ASC
                LIMIT $1 OFFSET $2;
            `;

        const semesterIdsResult = await pgPool.query(semesterIdsQuery, [
          limit,
          offset,
        ]);
        const semesterIds = semesterIdsResult.rows.map((row) => row.id);

        if (semesterIds.length === 0) {
          return res.status(200).json({
            data: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: page,
              limit,
            },
          });
        }

        // Then get the full semseter data with programs for these IDs
        const dataQuery = `
                 SELECT 
                    st.id AS semester_id,
                    st.title AS semester_title, 
                    st.year,
                    st.status,
                    st.created_at,
                    st.updated_at,
                    json_agg(
                        json_build_object(
                            'program_id', p.id,
                            'program_title', p.title
                        )
                    ) AS programs
                FROM semesters st
                LEFT JOIN program_semester ps ON st.id = ps.semester_id
                LEFT JOIN programs p ON ps.program_id = p.id
                WHERE st.id = ANY($1)
                GROUP BY st.id
                ORDER BY st.id ASC;`;

        const dataResult = await pgPool.query(dataQuery, [semesterIds]);

        const countQuery = `SELECT COUNT(*) FROM semesters;`;
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
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching semesters" });
    }
  },

  createSemester: async (req, res) => {
    const { title, year, program_ids, status = true } = req.body;

    if (!title || !Array.isArray(program_ids) || program_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields or empty program list." });
    }

    try {
      // Duplicate  check
      const duplicateCheck = await pgPool.query(
        "SELECT id FROM semesters WHERE title = $1",
        [title]
      );

      if (duplicateCheck.rowCount > 0) {
        return res.status(409).json({
          error: "A semester with the same title already exists.",
        });
      }

      const insertSemesters = await pgPool.query(
        `INSERT INTO semesters (title, year, status, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [title, year, status]
      );

      const semester = insertSemesters.rows[0];
      const semester_id = semester.id;

      // Insert all program links
      const programInsertPromises = program_ids.map((pid) =>
        pgPool.query(
          `INSERT INTO program_semester (semester_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
         RETURNING *`,
          [semester_id, pid]
        )
      );

      await Promise.all(programInsertPromises);

      return res.status(201).json({
        message: "Semester created successfully with assigned programs",
        semester,
      });
    } catch (error) {
      console.error("Error creating semester:", error);
      return res
        .status(500)
        .json({ message: "Server error while creating semester" });
    }
  },

  updateSemester: async (req, res) => {
    const semesterId = req.params.id;
    const { title, year, program_ids, status } = req.body;
    if (!title || !Array.isArray(program_ids) || program_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing required fields or empty program list." });
    }

    const duplicateCheck = await pgPool.query(
            "SELECT id FROM semesters WHERE title = $1 AND  id != $2",
            [title, semesterId]
        );

        if (duplicateCheck.rowCount > 0) {
            return res.status(409).json({
                error: "Another semester with the same title already exists.",
            });
        }

    try {
      const semesterCheck = await pgPool.query(
        "SELECT * FROM semesters WHERE id = $1",
        [semesterId]
      );
      if (semesterCheck.rowCount === 0) {
        return res.status(404).json({ error: "Semester not found." });
      }

      await pgPool.query(
        `UPDATE semesters 
       SET title = $1, year = $2, status = $3, updated_at = NOW() 
       WHERE id = $4`,
        [title, year, status, semesterId]
      );

      // Delete existing program links
      await pgPool.query(
        "DELETE FROM program_semester WHERE semester_id = $1",
        [semesterId]
      );

      // Insert new program links
      const insertPromises = program_ids.map((pid) =>
        pgPool.query(
          `INSERT INTO program_semester (semester_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [semesterId, pid]
        )
      );
      await Promise.all(insertPromises);

      return res
        .status(200)
        .json({ message: "Semester updated successfully." });
    } catch (error) {
      console.error("Error updating semester:", error);
      return res
        .status(500)
        .json({ message: "Server error while updating semester" });
    }
  },


  deleteSemester: async (req, res) => {
    const semesterId = req.params.id;

    try {
      const semesterCheck = await pgPool.query(
        "SELECT * FROM semesters WHERE id = $1",
        [semesterId]
      );
      if (semesterCheck.rowCount === 0) {
        return res.status(404).json({ error: "Semester not found." });
      }

      await pgPool.query("DELETE FROM program_semester WHERE semester_id = $1", [
        semesterId,
      ]);
     

      await pgPool.query("DELETE FROM semesters WHERE id = $1", [semesterId]);

      return res.status(200).json({
        message: "Semester and associated programs deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting semester:", error);
      return res
        .status(500)
        .json({ message: "Server error while deleting semester" });
    }
  },
};
