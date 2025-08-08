const { pgPool } = require("../../pg_constant");
const {
  Section,
  Program,
  Semester,
  ProgramSemesterSection,
} = require("../../models");
const sequelize = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getSections: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);
    try {
      // if (all) {
      //   const dataQuery = `
      //           SELECT
      //               sc.id AS sec_id,
      //               sc.title AS sec_title,
      //               sc.seat,
      //               sc.status,
      //               sc.created_at,
      //               sc.updated_at,
      //               p.id AS program_id,
      //               p.title AS program_title,
      //               JSON_AGG(
      //                 JSON_BUILD_OBJECT(
      //                   'semester_id', s.id,
      //                   'semester_title', s.title
      //                 ) ORDER BY s.title
      //               ) AS semesters
      //           FROM sections sc
      //           LEFT JOIN program_semester_sections pss ON sc.id = pss.section_id
      //           LEFT JOIN programs p ON pss.program_id = p.id
      //           LEFT JOIN semesters s ON pss.semester_id = s.id
      //           GROUP BY sc.id, sc.title, sc.seat, sc.status, sc.created_at, sc.updated_at, p.id, p.title
      //           ORDER BY sc.id;`;
      //   const dataResult = await pgPool.query(dataQuery);
      //   return res.status(200).json({ data: dataResult.rows });
      // }

      // else {
      //   const sectionIdsQuery = `
      //           SELECT id FROM sections
      //           ORDER BY id ASC
      //           LIMIT $1 OFFSET $2;`;
      //   const sectionIdsResult = await pgPool.query(sectionIdsQuery, [
      //     limit,
      //     offset,
      //   ]);
      //   const sectionIds = sectionIdsResult.rows.map((row) => row.id);

      //   if (sectionIds.length === 0) {
      //     return res.status(200).json({
      //       data: [],
      //       pagination: {
      //         totalItems: 0,
      //         totalPages: 0,
      //         currentPage: page,
      //         limit,
      //       },
      //     });
      //   }

      //   const dataQuery = `
      //           SELECT
      //               sc.id AS sec_id,
      //               sc.title AS sec_title,
      //               sc.seat,
      //               sc.status,
      //               sc.created_at,
      //               sc.updated_at,
      //               p.id AS program_id,
      //               p.title AS program_title,
      //               JSON_AGG(
      //                 JSON_BUILD_OBJECT(
      //                   'semester_id', s.id,
      //                   'semester_title', s.title
      //                 ) ORDER BY s.title
      //               ) AS semesters
      //           FROM sections sc
      //           LEFT JOIN program_semester_sections pss ON sc.id = pss.section_id
      //           LEFT JOIN programs p ON pss.program_id = p.id
      //           LEFT JOIN semesters s ON pss.semester_id = s.id
      //           WHERE sc.id = ANY($1)
      //           GROUP BY sc.id, sc.title, sc.seat, sc.status, sc.created_at, sc.updated_at, p.id, p.title
      //           ORDER BY sc.id;`;

      //   const dataResult = await pgPool.query(dataQuery, [sectionIds]);
      //   return res.status(200).json({ data: dataResult.rows });
      // }

      const sectionOptions = {
        include: [
          {
            model: ProgramSemesterSection,
            include: [
              { model: Program, attributes: ["id", "title"] },
              { model: Semester, attributes: ["id", "title"] },
            ],
          },
        ],
        order: [["id", "ASC"]],
        distinct: true, // ✅ Prevents duplicate rows due to joins
      };

      if (!all) {
        sectionOptions.limit = limit;
        sectionOptions.offset = offset;
      }

      const sections = await Section.findAll(sectionOptions);

      const formatted = sections.map((section) => {
        const firstProgram = section.ProgramSemesterSections[0]?.Program;

        const semesters = section.ProgramSemesterSections.map((pss) => ({
          semester_id: pss.Semester.id,
          semester_title: pss.Semester.title,
        })).sort((a, b) => a.semester_title.localeCompare(b.semester_title));

        return {
          sec_id: section.id,
          sec_title: section.title,
          seat: section.seat,
          status: section.status,
          created_at: section.created_at,
          updated_at: section.updated_at,
          program_id: firstProgram?.id || null,
          program_title: firstProgram?.title || null,
          semesters,
        };
      });

      const totalItems = await Section.count();
      const totalPages = Math.ceil(totalItems / limit);

      if (!formatted.length && !all) {
        return res.status(200).json({
          data: [],
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
          },
        });
      }

      return res.status(200).json({
        data: formatted,
        ...(all
          ? {}
          : {
              pagination: {
                totalItems, // Optional: Count separately if needed
                totalPages,
                currentPage: page,
                limit,
              },
            }),
      });
    } catch (error) {
      console.error("Error fetching sections:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  createSection: async (req, res) => {
    const {
      title,
      seat = null,
      program_id,
      status = true,
      semesterIds = [],
    } = req.body;

    if (
      !title ||
      (seat !== null && isNaN(seat)) ||
      !program_id ||
      !Array.isArray(semesterIds) ||
      semesterIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields or semesterIds must be a non-empty array.",
      });
    }

    try {
      // const duplicateCheck = await pgPool.query(
      //   "SELECT id FROM sections WHERE title = $1",
      //   [title]
      // );
      const existingSection = await Section.findOne({ where: { title } });

      // if (duplicateCheck.rowCount > 0) {
      //   return res.status(409).json({
      //     error: "A section with the same title already exists.",
      //   });
      // }
      if (existingSection) {
        return res.status(409).json({
          error: "A section with the same title already exists.",
        });
      }

      // Start a transaction
      // const client = await pgPool.connect();
      const transaction = await sequelize.transaction();
      try {
        // await client.query("BEGIN");

        // const insertSections = await client.query(
        //   `INSERT INTO sections (title, seat, status, created_at, updated_at)
        //    VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        //   [title, seat, status]
        // );

        const section = await Section.create(
          {
            title,
            seat,
            status,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction }
        );

        // const section = insertSections.rows[0];
        const section_id = section.id;

        // const programSemesterSectionInsertPromises = semesterIds.map(
        //   (semesterId) => {
        //     return client.query(
        //       `INSERT INTO program_semester_sections (program_id, semester_id, section_id, created_at, updated_at)
        //        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        //       [program_id, semesterId, section_id]
        //     );
        //   }
        // );

        // await Promise.all(programSemesterSectionInsertPromises);
        // await client.query("COMMIT");

        // Create entries in program_semester_sections
        const insertPromises = semesterIds.map((semester_id) =>
          ProgramSemesterSection.create(
            {
              program_id,
              semester_id,
              section_id,
            },
            { transaction }
          )
        );

        await Promise.all(insertPromises);

        await transaction.commit();

        return res.status(201).json({
          message: "Section created successfully.",
          section,
        });
      } catch (error) {
        // await client.query("ROLLBACK");
        // throw error;
        console.error("Error creating section:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      //  finally {
      //   client.release();
      // }
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
      program_id,
      status = true,
      semesterIds = [],
    } = req.body;

    if (
      !title ||
      (seat !== null && isNaN(seat)) ||
      !program_id ||
      !Array.isArray(semesterIds) ||
      semesterIds.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields or semesterIds must be a non-empty array.",
      });
    }

    try {
      // const duplicateCheck = await pgPool.query(
      //   "SELECT id FROM sections WHERE title = $1 AND id != $2",
      //   [title, sectionId]
      // );

      // if (duplicateCheck.rowCount > 0) {
      //   return res.status(409).json({
      //     error: "Another section with the same title already exists.",
      //   });
      // }

      // Duplicate title check (excluding current section)
      const duplicate = await Section.findOne({
        where: {
          title,
          id: { [Op.ne]: sectionId },
        },
      });

      if (duplicate) {
        return res.status(409).json({
          error: "Another section with the same title already exists.",
        });
      }

      // const sectionCheck = await pgPool.query(
      //   "SELECT * FROM sections WHERE id = $1",
      //   [sectionId]
      // );

      // if (sectionCheck.rowCount === 0) {
      //   return res.status(404).json({ error: "Section not found." });
      // }

      // // Start a transaction
      // const client = await pgPool.connect();

      // Check if section exists
      const section = await Section.findByPk(sectionId);
      if (!section) {
        return res.status(404).json({ error: "Section not found." });
      }

      // Begin transaction
      const transaction = await sequelize.transaction();
      try {
        // await client.query("BEGIN");

        // // Update the section
        // await client.query(
        //   `UPDATE sections
        //    SET title = $1, seat = $2, status = $3, updated_at = NOW()
        //    WHERE id = $4`,
        //   [title, seat, status, sectionId]
        // );

        // // Delete existing associations
        // await client.query(
        //   "DELETE FROM program_semester_sections WHERE section_id = $1",
        //   [sectionId]
        // );

        // Update section
        await section.update({ title, seat, status }, { transaction });

        // Delete existing ProgramSemesterSection entries
        await ProgramSemesterSection.destroy({
          where: { section_id: sectionId },
          transaction,
        });

        // Insert new associations
        // const programSemesterSectionInsertPromises = semesterIds.map(
        //   (semesterId) => {
        //     return client.query(
        //       `INSERT INTO program_semester_sections (program_id, semester_id, section_id, created_at, updated_at)
        //        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        //       [program_id, semesterId, sectionId]
        //     );
        //   }
        // );

        // await Promise.all(programSemesterSectionInsertPromises);
        // await client.query("COMMIT");

        // Re-create new entries
        const inserts = semesterIds.map((semesterId) => ({
          program_id,
          semester_id: semesterId,
          section_id: sectionId,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await ProgramSemesterSection.bulkCreate(inserts, { transaction });

        await transaction.commit();

        return res
          .status(200)
          .json({ message: "Section updated successfully." });
      } catch (error) {
        // await client.query("ROLLBACK");
        // throw error;

        console.error("Error updating section:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      // finally {
      //   client.release();
      // }
    } catch (error) {
      console.error("Error updating section:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteSection: async (req, res) => {
    const { sectionId } = req.params;

    // const checkSection = await pgPool.query(
    //   "SELECT * FROM sections WHERE id = $1",
    //   [sectionId]
    // );
    // if (checkSection.rowCount === 0) {
    //   return res.status(404).json({ error: "Section not found." });
    // }

    // // Start a transaction
    // const client = await pgPool.connect();

    // Check if section exists
    try {
      const section = await Section.findByPk(sectionId);

      if (!section) {
        return res.status(404).json({ error: "Section not found." });
      }

      // await client.query("BEGIN");

      // await client.query(
      //   "DELETE FROM program_semester_sections WHERE section_id = $1",
      //   [sectionId]
      // );

      // await client.query("DELETE FROM sections WHERE id = $1", [sectionId]);

      // await client.query("COMMIT");

      // Start transaction
      await sequelize.transaction(async (t) => {
        // Delete related entries from program_semester_sections
        await ProgramSemesterSection.destroy({
          where: { section_id: sectionId },
          transaction: t,
        });

        // Delete the section
        await Section.destroy({
          where: { id: sectionId },
          transaction: t,
        });
      });

      return res.status(200).json({ message: "Section deleted successfully." });
    } catch (error) {
      // await client.query("ROLLBACK");
      // throw error;
      console.error("Error deleting section:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    // finally {
    //   client.release();
    // }
  },
};
