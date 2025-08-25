const { StatusTypes, FeesDiscounts, FeesDiscountsStatusTypes, FeesTypes } = require("../../models");
const { pgPool } = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getFeesDiscounts: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = all ? 0 : (page - 1) * (limit || 0);
    
    try {
      const queryOptions = {
        include: [
          {
            model: StatusTypes,
            as: "typeDetails",
            attributes: ["id", "title"],
            through: { attributes: [] },
            required: false,
          },
          {
            model: FeesTypes,
            as: "feesTypes",
            attributes: ["id", "title"],
            through: { attributes: [] },
            required: false,
          }
        ],
        order: [["id", "ASC"]],
      };

      if (!all) {
        queryOptions.limit = limit;
        queryOptions.offset = offset;
      }

      const feesDiscounts = await FeesDiscounts.findAll(queryOptions);

      const formattedFeesDiscounts = feesDiscounts.map((discount) => ({
        id: discount.id,
        title: discount.title,
        start_date: discount.start_date,
        end_date: discount.end_date,
        amount: discount.amount,
        type: discount.typeDetails,
        fees_types: discount.feesTypes,
        status: discount.status,
        created_at: discount.created_at,
        updated_at: discount.updated_at,
      }));

      if (all) {
        return res.status(200).json({
          data: formattedFeesDiscounts,
          pagination: null,
        });
      }
      
      const totalItems = await FeesDiscounts.count();
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
        data: formattedFeesDiscounts,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching fees discounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
createFeesDiscount: async (req, res) => {
  const { title, start_date, end_date, amount, type, fees_types, status = true } = req.body;
  
  try {
  
    
  } catch (error) {
    console.error("Error creating fees discount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
},
  updateFeesDiscount: async (req, res) => {},
  deleteFeesDiscount: async (req, res) => {},
};
