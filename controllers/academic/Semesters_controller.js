const { Program, Semester, ProgramSemester } = require("../../models");
const { pgPool } = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getSemester: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    try {
      if (all) {
        const semesters = await Semester.findAll({
          attributes: [
            "id",
            ["title", "semester_title"],
            "year",
            "status",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: Program,
              through: { attributes: [] },
              attributes: [
                ["id", "program_id"],
                ["title", "program_title"],
              ],
              required: false,
            },
          ],
          order: [["id", "ASC"]],
        });

        // Format response
        const formattedSemesters = semesters.map((semester) => {
          const semesterJson = semester.toJSON();
          return {
            semester_id: semesterJson.id,
            semester_title: semesterJson.semester_title,
            year: semesterJson.year,
            status: semesterJson.status,
            created_at: semesterJson.created_at,
            updated_at: semesterJson.updated_at,
            programs: semesterJson.Programs || [],
          };
        });

        return res.status(200).json(formattedSemesters);
      } else {
        // Paginated version
        const { count, rows: semesters } = await Semester.findAndCountAll({
          attributes: ["id"],
          order: [["id", "ASC"]],
          limit,
          offset,
          distinct: true,
        });

        if (semesters.length === 0) {
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

        const semesterIds = semesters.map((semester) => semester.id);

        const semesterDetails = await Semester.findAll({
          attributes: [
            "id",
            ["title", "semester_title"],
            "year",
            "status",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: Program,
              through: { attributes: [] },
              attributes: [
                ["id", "program_id"],
                ["title", "program_title"],
              ],
              required: false,
            },
          ],
          where: { id: semesterIds },
          order: [["id", "ASC"]],
        });

        const formattedSemesters = semesterDetails.map((semester) => {
          const semesterJson = semester.toJSON();
          return {
            semester_id: semesterJson.id,
            semester_title: semesterJson.semester_title,
            year: semesterJson.year,
            status: semesterJson.status,
            created_at: semesterJson.created_at,
            updated_at: semesterJson.updated_at,
            programs: semesterJson.Programs || [],
          };
        });

        const totalItems = count;
        const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

        return res.status(200).json({
          data: formattedSemesters,
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
      const duplicateCheck = await Semester.findOne({
        where: {
          title: title,
        },
      });

      if (duplicateCheck) {
        return res.status(409).json({
          error: "A semester with the same title already exists.",
        });
      }

      // const insertSemesters = await pgPool.query(
      //   `INSERT INTO semesters (title, year, status, created_at, updated_at)
      //  VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      //   [title, year, status]
      // );
      const insertSemesters = await Semester.create({
        title: title,
        year: year,
        status: status,
      });

      const semester = insertSemesters;
      const semester_id = semester.id;

      // Insert all program links
      // const programInsertPromises = program_ids.map((pid) =>
      //   pgPool.query(
      //     `INSERT INTO program_semester (semester_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
      //    RETURNING *`,
      //     [semester_id, pid]
      //   )
      // );

      const programInsertPromises = program_ids.map((pid) =>
        ProgramSemester.create({
          semester_id: semester_id,
          program_id: pid,
        })
      );

      await Promise.all(programInsertPromises);

      return res.status(201).json({
        message: "Semester created successfully.",
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

    try {
    
      const SemesterCheck = await Semester.findByPk(semesterId);

      if (!SemesterCheck) {
        return res.status(404).json({ error: "Semester not found." });
      }

      // await pgPool.query(
      //   `UPDATE semesters
      //  SET title = $1, year = $2, status = $3, updated_at = NOW()
      //  WHERE id = $4`,
      //   [title, year, status, semesterId]
      // );

      await Semester.update(
        {
          title: title,
          year: year,
          status: status,
        },
        {
          where: {
            id: semesterId,
          },
        }
      );
      // Delete existing program links
      // await pgPool.query(
      //   "DELETE FROM program_semester WHERE semester_id = $1",
      //   [semesterId]
      // );

      await ProgramSemester.destroy({
        where: {
          semester_id: semesterId,
        },
      })
      // Insert new program links
      // const insertPromises = program_ids.map((pid) =>
      //   pgPool.query(
      //     `INSERT INTO program_semester (semester_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      //     [semesterId, pid]
      //   )
      // );
      const insertPromises = program_ids.map((pid) =>
        ProgramSemester.create({
        
          semester_id: semesterId,
          program_id: pid,
        })
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
      const semesterCheck = await Semester.findByPk(semesterId);

      if (!semesterCheck) {
        return res.status(404).json({ error: "Semester not found." });
      }

      // await pgPool.query(
      //   "DELETE FROM program_semester WHERE semester_id = $1",
      //   [semesterId]
      // );
      await ProgramSemester.destroy({
        where:{
          semester_id:semesterId
        }
      })
      // await pgPool.query("DELETE FROM semesters WHERE id = $1", [semesterId]);
      await Semester.destroy({
        where: {
          id: semesterId,
        },
      })
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
