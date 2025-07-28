const { pgPool } = require("../../pg_constant");
const logger = require("../../utils/logger");

// const getSessions = async (req, res) => {
//   const all = req.query.all === "true";
//   const page = parseInt(req.query.page) || 1;
//   const limit = all ? null : parseInt(req.query.limit) || 10;
//   const offset = (page - 1) * (limit || 0);

//   try {
//     let dataQuery, dataParams;

//     if (all) {
//       dataQuery = `
//         SELECT
//           s.id AS session_id,
//           s.title AS session_title,
//           s.start_date,
//           s.end_date,
//           s.current,
//           s.status,
//           s.updated_at,
//           ps.program_id,
//           p.title AS program_title
//         FROM sessions s
//         LEFT JOIN program_session ps ON s.id = ps.session_id
//         LEFT JOIN programs p ON ps.program_id = p.id
//         ORDER BY s.id ASC;
//       `;
//       dataParams = [];
//     } else {
//       dataQuery = `
//         SELECT
//           s.id AS session_id,
//           s.title AS session_title,
//           s.start_date,
//           s.end_date,
//           s.current,
//           s.status,
//           s.updated_at,
//           ps.program_id,
//           p.title AS program_title
//         FROM sessions s
//         LEFT JOIN program_session ps  ON s.id = ps.session_id
//         LEFT JOIN programs p ON ps.program_id = p.id
//         ORDER BY s.id ASC
//         LIMIT $1 OFFSET $2;

//       `;
//       dataParams = [limit, offset];
//     }

//     const dataResult = await pgPool.query(dataQuery, dataParams);
//     // console.log(dataResult.rows);
//     // console.log(dataResult.rows.length);

//     if (all) {
//       return res.status(200).json({ data: dataResult.rows });
//     }

//     // Count total batches (for pagination)
//     // const countQuery = `SELECT COUNT(*) FROM sessions;`;
//     // const countResult = await pgPool.query(countQuery);
//     const totalItems = parseInt(dataResult.rows.length);
//     const totalPages = Math.ceil(totalItems / limit);

//     return res.status(200).json({
//       data: dataResult.rows,
//       pagination: {
//         totalItems,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching sessions:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching sessions" });
//   }
// };

const getSessions = async (req, res) => {
  const all = req.query.all === "true";
  const page = parseInt(req.query.page) || 1;
  const limit = all ? null : parseInt(req.query.limit) || 10;
  const offset = (page - 1) * (limit || 0);

  try {
    if (all) {
      // All sessions without pagination
      const dataQuery = `
        SELECT 
          s.id AS session_id,
          s.title AS session_title,
          s.start_date,
          s.end_date,
          s.current,
          s.status,
          s.updated_at,
          json_agg(
            json_build_object(
              'program_id', p.id,
              'program_title', p.title
            )
          ) AS programs
        FROM sessions s
        LEFT JOIN program_session ps ON s.id = ps.session_id
        LEFT JOIN programs p ON ps.program_id = p.id
        GROUP BY s.id
        ORDER BY s.id ASC;
      `;
      const dataResult = await pgPool.query(dataQuery);
      return res.status(200).json({ data: dataResult.rows });
    } else {
      // Paginated version
      const sessionIdsQuery = `
        SELECT id FROM sessions
        ORDER BY id ASC
        LIMIT $1 OFFSET $2;
      `;
      const sessionIdsResult = await pgPool.query(sessionIdsQuery, [
        limit,
        offset,
      ]);
      const sessionIds = sessionIdsResult.rows.map((row) => row.id);

      if (sessionIds.length === 0) {
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
          s.id AS session_id,
          s.title AS session_title,
          s.start_date,
          s.end_date,
          s.current,
          s.status,
          s.updated_at,
          json_agg(
            json_build_object(
              'program_id', p.id,
              'program_title', p.title
            )
          ) AS programs
        FROM sessions s
        LEFT JOIN program_session ps ON s.id = ps.session_id
        LEFT JOIN programs p ON ps.program_id = p.id
        WHERE s.id = ANY($1)
        GROUP BY s.id
        ORDER BY s.id ASC;
      `;
      const dataResult = await pgPool.query(dataQuery, [sessionIds]);

      const countQuery = `SELECT COUNT(*) FROM sessions;`;
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

  try {
    // Duplicate batch check
    const duplicateCheck = await pgPool.query(
      "SELECT id FROM sessions WHERE title = $1 AND start_date = $2 AND end_date = $3",
      [title, start_date, end_date]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        error:
          "A session with the same title, start date, and end date already exists.",
      });
    }

    const insertSessions = await pgPool.query(
      `INSERT INTO sessions (title, start_date, end_date, current, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
      [title, start_date, end_date, current, status]
    );

    const session = insertSessions.rows[0];
    const session_id = session.id;

    // Insert all program links
    const programInsertPromises = program_ids.map((pid) =>
      pgPool.query(
        `INSERT INTO program_session (session_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
         RETURNING *`,
        [session_id, pid]
      )
    );

    await Promise.all(programInsertPromises);

    return res.status(201).json({
      message: "Session created successfully with assigned programs",
      session,
    });
  } catch (error) {
    console.error("Error creating session:", error);
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
    !end_date ||
    !current ||
    !Array.isArray(program_ids) ||
    program_ids.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields or empty program list." });
  }

  try {
    const sessionCheck = await pgPool.query(
      "SELECT * FROM sessions WHERE id = $1",
      [sessionId]
    );
    if (sessionCheck.rowCount === 0) {
      return res.status(404).json({ error: "Session not found." });
    }

    await pgPool.query(
      `UPDATE sessions 
   SET title = $1, start_date = $2, end_date = $3, current = $4, status = $5, updated_at = NOW() 
   WHERE id = $6`,
      [title, start_date, end_date, current, status, sessionId]
    );

    // Delete existing program links
    await pgPool.query("DELETE FROM program_session WHERE session_id = $1", [
      sessionId,
    ]);

    // Insert new program links
    const insertPromises = program_ids.map((pid) =>
      pgPool.query(
        `INSERT INTO program_session (session_id, program_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [sessionId, pid]
      )
    );
    await Promise.all(insertPromises);

    return res.status(200).json({ message: "Session updated successfully." });
  } catch (error) {
    console.error("Error updating session:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating session" });
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
};
