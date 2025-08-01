const { Op } = require("sequelize");
const { Session, Program, ProgramSession } = require("../../models");
const sequelize = require("../../pg_constant");
const { pgPool } = require("../../pg_constant");
const logger = require("../../utils/logger");

const getSessions = async (req, res) => {
  const all = req.query.all === "true";
  const page = parseInt(req.query.page) || 1;
  const limit = all ? null : parseInt(req.query.limit) || 10;
  const offset = (page - 1) * (limit || 0);

  try {
    if (all) {
      // All sessions without pagination
      // const dataQuery = `
      //   SELECT
      //     s.id AS session_id,
      //     s.title AS session_title,
      //     s.start_date,
      //     s.end_date,
      //     s.current,
      //     s.status,
      //     s.updated_at,
      //     json_agg(
      //       json_build_object(
      //         'program_id', p.id,
      //         'program_title', p.title
      //       )
      //     ) AS programs
      //   FROM sessions s
      //   LEFT JOIN program_session ps ON s.id = ps.session_id
      //   LEFT JOIN programs p ON ps.program_id = p.id
      //   GROUP BY s.id
      //   ORDER BY s.id ASC;
      // `;
      // const dataResult = await pgPool.query(dataQuery);
      // return res.status(200).json({ data: dataResult.rows });

      const sessions = await Session.findAll({
        include: [
          {
            model: Program,
            through: { attributes: [] }, // exclude join table fields
            attributes: ["id", "title"],
          },
        ],
        order: [["id", "ASC"]],
      });

      const formatted = sessions?.map((session) => ({
        session_id: session.id,
        session_title: session.title,
        start_date: session.start_date,
        end_date: session.end_date,
        current: session.current,
        status: session.status,
        updated_at: session.updated_at,
        programs: session.Programs.map((p) => ({
          program_id: p.id,
          program_title: p.title,
        })),
      }));

      return res.status(200).json({ data: formatted });
    } else {
      // Paginated version
      // const sessionIdsQuery = `
      //   SELECT id FROM sessions
      //   ORDER BY id ASC
      //   LIMIT $1 OFFSET $2;
      // `;
      // const sessionIdsResult = await pgPool.query(sessionIdsQuery, [
      //   limit,
      //   offset,
      // ]);

      const { count, rows } = await Session.findAndCountAll({
        include: [
          {
            model: Program,
            through: { attributes: [] }, // exclude join table fields
            attributes: ["id", "title"],
          },
        ],
        order: [["id", "ASC"]],
        limit,
        offset,
      });
      // const sessionIds = sessionIdsResult.rows.map((row) => row.id);

      // if (sessionIds.length === 0) {
      //   return res.status(200).json({
      //     data: [],
      //     pagination: {
      //       totalItems: 0,
      //       totalPages: 0,
      //       currentPage: page,
      //       limit,
      //     },
      //   });
      // }

      const totalPages = Math.ceil(count / limit);

      const formatted = rows.map((session) => ({
        session_id: session.id,
        session_title: session.title,
        start_date: session.start_date,
        end_date: session.end_date,
        current: session.current,
        status: session.status,
        updated_at: session.updated_at,
        programs: session.Programs.map((p) => ({
          program_id: p.id,
          program_title: p.title,
        })),
      }));

      // const dataQuery = `
      //   SELECT
      //     s.id AS session_id,
      //     s.title AS session_title,
      //     s.start_date,
      //     s.end_date,
      //     s.current,
      //     s.status,
      //     s.updated_at,
      //     json_agg(
      //       json_build_object(
      //         'program_id', p.id,
      //         'program_title', p.title
      //       )
      //     ) AS programs
      //   FROM sessions s
      //   LEFT JOIN program_session ps ON s.id = ps.session_id
      //   LEFT JOIN programs p ON ps.program_id = p.id
      //   WHERE s.id = ANY($1)
      //   GROUP BY s.id
      //   ORDER BY s.id ASC;
      // `;
      // const dataResult = await pgPool.query(dataQuery, [sessionIds]);

      // const countQuery = `SELECT COUNT(*) FROM sessions;`;
      // const countResult = await pgPool.query(countQuery);
      // const totalItems = parseInt(countResult.rows[0].count);
      // const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        // data: dataResult.rows,
        data: formatted,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching sessions" });
  }
};

const createSession = async (req, res) => {
  const {
    title,
    start_date,
    end_date,
    program_ids,
    current = false,
    status = true,
  } = req.body;

  if (
    !title ||
    !start_date ||
    !end_date ||
    !Array.isArray(program_ids) ||
    program_ids.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields or empty program list." });
  }
  const t = await sequelize.transaction();

  try {
    // Duplicate batch check
    // const duplicateCheck = await pgPool.query(
    //   "SELECT id FROM sessions WHERE title = $1 AND start_date = $2 AND end_date = $3",
    //   [title, start_date, end_date]
    // );

    const duplicate = await Session.findOne({
      where: { title, start_date, end_date },
      transaction: t,
    });

    if (duplicate) {
      await t.rollback();
      return res.status(409).json({
        error:
          "A session with the same title, start date, and end date already exists.",
      });
    }

    // if (duplicateCheck.rowCount > 0) {
    //   return res.status(409).json({
    //     error:
    //       "A session with the same title, start date, and end date already exists.",
    //   });
    // }

    // const insertSessions = await pgPool.query(
    //   `INSERT INTO sessions (title, start_date, end_date, current, status, created_at, updated_at)
    //    VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
    //   [title, start_date, end_date, current, status]
    // );

    // Create session
    const newSession = await Session.create(
      {
        title,
        start_date,
        end_date,
        current,
        status,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction: t }
    );

    // const session = insertSessions.rows[0];
    // const session_id = session.id;

    // Insert all program links
    // const programInsertPromises = program_ids.map((pid) =>
    //   pgPool.query(
    //     `INSERT INTO program_session (session_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
    //      RETURNING *`,
    //     [session_id, pid]
    //   )
    // );

    // await Promise.all(programInsertPromises);

    // Insert related program links
    const programRecords = program_ids.map((program_id) => ({
      session_id: newSession.id,
      program_id,
    }));

    await ProgramSession.bulkCreate(programRecords, {
      ignoreDuplicates: true, // Sequelize v6+ required
      transaction: t,
    });

    await t.commit();

    return res.status(201).json({
      message: "Session created successfully with assigned programs",
      session: newSession,
    });

    // return res.status(201).json({
    //   message: "Session created successfully with assigned programs",
    //   session,
    // });
  } catch (error) {
    console.error("Error creating session:", error);
    await t.rollback();
    return res
      .status(500)
      .json({ message: "Server error while creating session" });
  }
};

const updateSession = async (req, res) => {
  const sessionId = req.params.id;
  const { title, start_date, end_date, current, program_ids, status } =
    req.body;

  if (
    !title ||
    !start_date ||
    // !end_date ||
    // !current ||
    !Array.isArray(program_ids) ||
    program_ids.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields or empty program list." });
  }

  try {
    // const duplicateCheck = await pgPool.query(
    //   "SELECT id FROM sessions WHERE title = $1 AND  id != $2",
    //   [title, sessionId]
    // );

    // if (duplicateCheck.rowCount > 0) {
    //   return res.status(409).json({
    //     error: "Another session with the same title already exists.",
    //   });
    // }

    const duplicateSession = await Session.findOne({
      where: {
        title,
        id: { [Op.ne]: sessionId }, // Not the current session
      },
    });

    if (duplicateSession) {
      return res.status(409).json({
        error: "Another session with the same title already exists.",
      });
    }

    // const sessionCheck = await pgPool.query(
    //   "SELECT * FROM sessions WHERE id = $1",
    //   [sessionId]
    // );
    // if (sessionCheck.rowCount === 0) {
    //   return res.status(404).json({ error: "Session not found." });
    // }

    // Find the session
    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    //   await pgPool.query(
    //     `UPDATE sessions
    //  SET title = $1, start_date = $2, end_date = $3, current = $4, status = $5, updated_at = NOW()
    //  WHERE id = $6`,
    //     [title, start_date, end_date, current, status, sessionId]
    //   );

    // Update session fields
    await session.update({
      title,
      start_date,
      end_date,
      current,
      status,
      updated_at: new Date(),
    });

    // Update many-to-many relation: setPrograms replaces existing relations
    const programs = await Program.findAll({
      where: {
        id: program_ids,
      },
    });

    // Delete existing program links
    // await pgPool.query("DELETE FROM program_session WHERE session_id = $1", [
    //   sessionId,
    // ]);

    await session.setPrograms(programs);

    // // Insert new program links
    // const insertPromises = program_ids.map((pid) =>
    //   pgPool.query(
    //     `INSERT INTO program_session (session_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    //     [sessionId, pid]
    //   )
    // );
    // await Promise.all(insertPromises);

    // Update many-to-many relation: setPrograms replaces existing relations

    // const programs = await Program.findAll({
    //   where: {
    //     id: program_ids,
    //   },
    // });

    return res.status(200).json({ message: "Session updated successfully." });
  } catch (error) {
    console.error("Error updating session:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating session" });
  }
};

const deleteSession = async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    // const sessionCheck = await pgPool.query(
    //   "SELECT * FROM sessions WHERE id = $1",
    //   [sessionId]
    // );
    // if (sessionCheck.rowCount === 0) {
    //   return res.status(404).json({ error: "Session not found." });
    // }

    // Check if the session exists
    const session = await Session.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // await pgPool.query("DELETE FROM program_session WHERE session_id = $1", [
    //   sessionId,
    // ]);

    // Delete the associated records from the join table (many-to-many relation)
    await session.setPrograms([]); // Removes all associations from the join table

    // await pgPool.query("DELETE FROM sessions WHERE id = $1", [sessionId]);

    // Delete the session itself
    await session.destroy();

    return res.status(200).json({
      message: "Session and associated programs deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting session" });
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
};
