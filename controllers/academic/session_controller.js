const { pgPool } = require("../../pg_constant");
const logger = require("../../utils/logger");

const getSessions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit || 10);
  const offSet = (page - 1) * limit;
  logger.info("Inside getSessions table");

  try {
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit" });
    }

    const query = `SELECT * FROM sessions ORDER BY id ASC LIMIT $1 OFFSET $2;`;
    const result = await pgPool.query(query, [limit, offSet]);

    const countResult = await pgPool.query("SELECT COUNT(*) FROM sessions");
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    if (page > totalPages && totalItems > 0) {
      return res.status(404).json({
        error: `Current Page ${page} exceed total records ${totalItems} limit ${limit}`,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    }

    return res.status(200).json({
      data: result.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });

  } catch (error) {
    logger.error("Error in getSessions:", error);
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const createSession = async (req, res) => {
    
    try {
        
    } catch (error) {
        logger.log
    }


};


module.exports = {
  getSessions,
};
