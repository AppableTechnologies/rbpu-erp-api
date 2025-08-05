const { pgPool } = require("../../pg_constant");
const { Faculty, Program } = require("../../models");
const { Op } = require("sequelize");
const { generateSlug } = require("../../utils/helpers");
module.exports = {
  getPrograms: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = all ? 0 : (page - 1) * (limit || 0);

    try {
      // let dataQuery, dataParams;
      // // Common query options
      const queryOptions = {
        include: [
          {
            model: Faculty,
            as: "faculty",
            attributes: ["id", "title"],
            required: false, // LEFT JOIN
          },
        ],
        order: [["id", "ASC"]],
      };

      // Apply pagination only if not fetching all
      if (!all) {
        queryOptions.limit = limit;
        queryOptions.offset = offset;
      }

      // Fetch programs
      const programs = await Program.findAll(queryOptions);

      // Manually format the response to match original structure
      const formattedPrograms = programs.map((program) => ({
        program_id: program.id,
        title: program.title,
        faculty_id: program.faculty?.id || null,
        faculty_title: program.faculty?.title || null,
        slug: program.slug,
        shortcode: program.shortcode,
        registration: program.registration,
        status: program.status,
        created_at: program.created_at,
        updated_at: program.updated_at,
      }));

      // if (all) {
      //   dataQuery = `
      //   SELECT
      //     programs.id AS program_id,
      //     programs.title,
      //     faculties.id AS faculty_id,
      //     faculties.title AS faculty_title,
      //     programs.slug,
      //     programs.shortcode,
      //     programs.registration,
      //     programs.status,
      //     programs.created_at,
      //     programs.updated_at
      //   FROM programs
      //   LEFT JOIN faculties ON programs.faculty_id = faculties.id
      //   ORDER BY programs.id ASC;
      // `;
      //   dataParams = [];
      // }

      //  else {
      //   dataQuery = `
      //   SELECT
      //     programs.id AS program_id,
      //     programs.title,
      //     faculties.id AS faculty_id,
      //     faculties.title AS faculty_title,
      //     programs.slug,
      //     programs.shortcode,
      //     programs.registration,
      //     programs.status,
      //     programs.created_at,
      //     programs.updated_at
      //   FROM programs
      //   LEFT JOIN faculties ON programs.faculty_id = faculties.id
      //   ORDER BY programs.id ASC
      //   LIMIT $1 OFFSET $2;
      // `;
      //   dataParams = [limit, offset];
      // }

      // const dataResult = await pgPool.query(dataQuery, dataParams);

      // if (all) {
      //   return res.status(200).json({
      //     data: dataResult.rows,
      //     pagination: null,
      //   });
      // }

      if (all) {
        return res.status(200).json({
          data: formattedPrograms,
          pagination: null,
        });
      }

      // For paginated results only
      // const countQuery = `SELECT COUNT(*) FROM programs;`;
      // const countResult = await pgPool.query(countQuery);
      // const totalItems = parseInt(countResult.rows[0].count);
      // const totalPages = Math.ceil(totalItems / limit);

      // Count total records (only when paginating)
      const totalItems = await Program.count();
      const totalPages = Math.ceil(totalItems / limit);

      if (page > totalPages && totalItems > 0) {
        return res.status(404).json({
          error: `Page ${page} not found. Total pages: ${totalPages}`,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
          },
        });
      }

      return res.status(200).json({
        data: formattedPrograms,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
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
      // const facultyCheck = await pgPool.query(
      //   "SELECT id FROM faculties WHERE id = $1",
      //   [faculty_id]
      // );
      // if (facultyCheck.rows.length === 0) {
      //   return res.status(400).json({
      //     message: "Faculty does not exist",
      //   });
      // }

      const facultyExists = await Faculty.findByPk(faculty_id);
      if (!facultyExists) {
        return res.status(400).json({
          message: "Faculty does not existt",
        });
      }

      // const slug = title
      //   .toLowerCase()
      //   .replace(/\s+/g, "-")
      //   .replace(/[^\w-]+/g, "");

      const slug = generateSlug(title);

      // const programCheck = await pgPool.query(
      //   `SELECT id FROM programs
      //  WHERE LOWER(title) = LOWER($1) OR slug = $2`,
      //   [title, slug]
      // );
      // if (programCheck.rows.length > 0) {
      //   return res.status(400).json({
      //     message: "Program with this title or slug already exists",
      //   });
      // }

      const existingProgram = await Program.findOne({
        where: {
          [Op.or]: [{ title: title }, { slug: slug }],
        },
      });

      if (existingProgram) {
        return res.status(400).json({
          message: "Program with this title or slug already exists",
        });
      }

      // const result = await pgPool.query(
      //   `INSERT INTO programs (
      //   faculty_id,
      //   title,
      //   slug,
      //   shortcode,
      //   registration,
      //   status,
      //   created_at,
      //   updated_at
      // ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      // RETURNING *`,
      //   [faculty_id, title, slug, shortcode || null, false, true]
      // );

      const newProgram = await Program.create({
        faculty_id,
        title,
        slug,
        shortcode: shortcode || null,
        registration: false,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // return res.status(201).json(result.rows[0]);
      return res.status(201).json(newProgram);
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
    // const slug = title
    //   .toLowerCase()
    //   .replace(/\s+/g, "-")
    //   .replace(/[^\w-]+/g, "");

    if (!title || (shortcode && typeof shortcode !== "string")) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const slug = generateSlug(title);

    try {
      const existingProgram = Program.findByPk(id);

      if (!existingProgram) {
        return res.status(404).json({ message: "Program not found" });
      }

      // const duplicateCheck = await pgPool.query(
      //   "SELECT id FROM programs  WHERE title = $1 AND  id != $2",
      //   [title, id]
      // );

      // if (duplicateCheck.rowCount > 0) {
      //   return res.status(409).json({
      //     error: "Another program with the same title already exists.",
      //   });
      // }

      const duplicateProgram = await Program.findOne({
        where: {
          title,
          id: {
            [Op.ne]: id,
          },
        },
      });

      if (duplicateProgram) {
        return res.status(409).json({
          error: "Another program with the same title already exists.",
        });
      }

      // const facultyCheck = await pgPool.query(
      //   "SELECT id FROM faculties WHERE id = $1",
      //   [faculty_id]
      // );
      // if (facultyCheck.rows.length === 0) {
      //   return res.status(400).json({ message: "Faculty does not exist" });
      // }

      const faculty = await Faculty.findByPk(faculty_id);
      if (!faculty) {
        return res.status(400).json({ message: "Faculty does not exist" });
      }

      // const result = await pgPool.query(
      //   `UPDATE programs
      //  SET title = $1, slug = $2, shortcode = $3, status = $4, faculty_id = $5, updated_at = NOW()
      //  WHERE id = $6
      //  RETURNING *`,
      //   [title, slug, shortcode || null, status, faculty_id, id]
      // );
      // if (result.rowCount === 0) {
      //   return res.status(404).json({ message: "Program not found" });
      // }

      const updatedProgram = await Program.update(
        {
          title,
          slug,
          shortcode: shortcode || null,
          status,
          faculty_id,
          updated_at: new Date(),
        },
        { where: { id } }
      );

      return res.status(200).json(updatedProgram);
    } catch (error) {
      console.error("Error updating program:", error);
      return res
        .status(500)
        .json({ message: "Server error while updating program" });
    }
  },
  deleteProgram: async (req, res) => {
    const { id } = req.params;
    try {
      const program = await Program.findByPk(id);

      if (!program) {
        return res
          .status(404)
          .json({ message: `Program not found to delete with this ${id}` });
      }

     await Program.destroy({ where: { id } });

      // const result = await pgPool.query(
      //   `DELETE FROM programs
      // WHERE id = $1
      // RETURNING *;`,
      //   [id]
      // );
      // if (result.rowCount === 0) {
      //   return res.status(404).json({ message: "Program not found" });
      // }
      res
        .status(200)
        .json({ message: `Program deleted successfully with id ${id}` });
    } catch (error) {
      console.error("Error deleting program:", error);
      res.status(500).json({ message: "Server error while deleting program" });
    }
  },
};
