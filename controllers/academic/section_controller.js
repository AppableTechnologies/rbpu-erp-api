const { pgPool } = require("../../pg_constant");
module.exports = {
  getSections: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);
    try {
      if (all) {
        const dataQuery = `
                SELECT
                    sc.id AS sec_id,
                    sc.title AS sec_title,
                    sc.seat,
                    sc.status,
                    sc.created_at,
                    sc.updated_at,
                    p.id AS program_id,
                    p.title AS program_title,
                    JSON_AGG(DISTINCT s.title ORDER BY s.title) AS semesters
                FROM sections sc
                LEFT JOIN program_semester_sections pss ON sc.id = pss.section_id
                LEFT JOIN programs p ON pss.program_id = p.id
                LEFT JOIN semesters s ON pss.semester_id = s.id
                GROUP BY sc.id, sc.title, sc.seat, sc.status, sc.created_at, sc.updated_at, p.id, p.title
                ORDER BY sc.id;`;
        const dataResult = await pgPool.query(dataQuery);
        return res.status(200).json({ data: dataResult.rows });
      } else {
        const sectionIdsQuery = `
                SELECT id FROM sections
                ORDER BY id ASC
                LIMIT $1 OFFSET $2;`;
        const sectionIdsResult = await pgPool.query(sectionIdsQuery, [
          limit,
          offset,
        ]);
        const sectionIds = sectionIdsResult.rows.map((row) => row.id);

        if (sectionIds.length === 0) {
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

        const dataQuery = `
                SELECT
                    sc.id AS sec_id,
                    sc.title AS sec_title,
                    sc.seat,
                    sc.status,
                    sc.created_at,
                    sc.updated_at,
                    p.id AS program_id,
                    p.title AS program_title,
                    JSON_AGG(DISTINCT s.title ORDER BY s.title) AS semesters
                FROM sections sc
                LEFT JOIN program_semester_sections pss ON sc.id = pss.section_id
                LEFT JOIN programs p ON pss.program_id = p.id
                LEFT JOIN semesters s ON pss.semester_id = s.id
                WHERE sc.id = ANY($1)
                GROUP BY sc.id, sc.title, sc.seat, sc.status, sc.created_at, sc.updated_at, p.id, p.title
                ORDER BY sc.id;`;

        const dataResult = await pgPool.query(dataQuery, [sectionIds]);
        return res.status(200).json({ data: dataResult.rows });
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  createSection: async (req, res) => {
    const {
      title,
      seat = null,
      status = true,
      programId,
      semesterIds,
    } = req.body;
    if (
      !title ||
      (seat !== null && typeof seat !== "number") ||
      !programId ||
      !Array.isArray(semesterIds) ||
      semesterIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "All fields are required or empty semester list." });
    }

    try {
      const duplicateCheck = await pgPool.query(
        "SELECT id FROM sections WHERE title = $1",
        [title]
      );

      if (duplicateCheck.rowCount > 0) {
        return res.status(409).json({
          error: "A section with the same title already exists.",
        });
      }
      const insertSections = await pgPool.query(
        `INSERT INTO sections (title, seat, status, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [title, seat, status]
      );

      const section = insertSections.rows[0];
      const section_id = section.id;

      const programSemesterSectionInsertPromises = semesterIds.map(
        (semesterId) => {
          return pgPool.query(
            `INSERT INTO program_semester_sections (program_id, semester_id, section_id ,created_at, updated_at)
            VALUES ($1, $2, $3 , NOW(), NOW()) RETURNING *`,
            [programId, semesterId, section_id]
          );
        }
      );
      await Promise.all(programSemesterSectionInsertPromises);
      return res.status(201).json({
        message: "Section created successfully.",
        section,
      });
    } catch (error) {
      console.error("Error creating section:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateSection: async (req, res) => {
    const { sectionId } = req.params;
    const {
      title,
      seat = null,
      status = true,
      programId,
      semesterIds,
    } = req.body;
    if (
      !title ||
      (seat !== null && typeof seat !== "number") ||
      !programId ||
      !Array.isArray(semesterIds) ||
      semesterIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or empty program list." });
    }

    const duplicateCheck = await pgPool.query(
      "SELECT id FROM sections WHERE title = $1 AND  id != $2",
      [title, sectionId]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        error: "Another section with the same title already exists.",
      });
    }

    try {
      const sectionCheck = await pgPool.query(
        "SELECT * FROM sections WHERE id = $1",
        [sectionId]
      );
      if (sectionCheck.rowCount === 0) {
        return res.status(404).json({ error: "Section not found." });
      }
      await pgPool.query(
        `UPDATE sections
         SET title = $1, seat = $2, status = $3, updated_at = NOW()
         WHERE id = $4`,
        [title, seat, status, sectionId]
      );
      await pgPool.query(
        "DELETE FROM program_semester_sections WHERE section_id = $1",
        [sectionId]
      );
      const programSemesterSectionInsertPromises = semesterIds.map(
        (semesterId) => {
          return pgPool.query(
            `INSERT INTO program_semester_sections (program_id, semester_id, section_id ,created_at, updated_at)
                VALUES ($1, $2, $3 , NOW(), NOW()) RETURNING *`,
            [programId, semesterId, sectionId]
          );
        }
      );
      await Promise.all(programSemesterSectionInsertPromises);
      return res.status(200).json({ message: "Section updated successfully." });
    } catch (error) {
      console.error("Error updating section:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteSection: async (req, res) => {
    const { sectionId } = req.params;
    try {
      const checkSection = await pgPool.query(
        "SELECT * FROM sections WHERE id = $1",
        [sectionId]
      );
      if (checkSection.rowCount === 0) {
        return res.status(404).json({ error: "Section not found." });
      }
      await pgPool.query(
        "DELETE FROM program_semester_sections WHERE section_id = $1",
        [sectionId]
      );
      await pgPool.query("DELETE FROM sections WHERE id = $1", [sectionId]);
      return res.status(200).json({ message: "Section deleted successfully." });
    } catch (error) {
      console.error("Error deleting section:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
