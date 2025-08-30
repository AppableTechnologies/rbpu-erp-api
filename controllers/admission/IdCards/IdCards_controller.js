const { pgPool } = require("../../../pg_constant");
// const {}
const { Op } = require("sequelize");


module.exports ={
  getAllIdCards: async (req, res) => {
    try {
      const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    } catch (error) {
      console.error("Error fetching ID Cards:", error);
      res.status(500).json({ error: "Internal Server Error" });      
    } 
  }
}