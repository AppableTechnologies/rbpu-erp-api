const {
  FeesTypes,
  FeesFines,
  FeesCategoryFeesFines,
} = require("../../models");
const { pgPool } = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getFeesFines: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    try {
      if (all) {
        const feesFines = await FeesFines.findAll({
          attributes: [
            "id",
            "start_day",
            "end_day",
            "amount",
            "type",
            "status",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: FeesTypes,
              through: { attributes: [] },
              attributes: [
                ["id", "fees_type_id"],
                ["title", "fees_type_title"],
              ],
              as: "feesTypes",
              required: false,
            },
          ],
          group: ["FeesFines.id", "feesTypes.id"],
          order: [["id", "ASC"]],
          subQuery: false,
        });

        const formattedFeesFines = feesFines.map((fines) => {
          const feesFinesJson = fines.toJSON();
          return {
            fees_fine_id: feesFinesJson.id,
            start_day: feesFinesJson.start_day,
            end_day: feesFinesJson.end_day,
            amount: feesFinesJson.amount,
            type: feesFinesJson.type,
            status: feesFinesJson.status,
            created_at: feesFinesJson.created_at,
            updated_at: feesFinesJson.updated_at,
            fees_types: feesFinesJson.feesTypes
              ? feesFinesJson.feesTypes.map((feesType) => ({
                  fees_type_id: feesType.fees_type_id,
                  fees_type_title: feesType.fees_type_title,
                }))
              : [],
          };
        });

        return res.status(200).json({ data: formattedFeesFines });
      } else {
        // For paginated fees discounts
        const { count, rows: feesFines } = await FeesFines.findAndCountAll({
          attributes: ["id"],
          order: [["id", "ASC"]],
          limit,
          offset,
          distinct: true,
        });

        if (feesFines.length === 0) {
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

        const feesFinesIds = feesFines.map((discount) => discount.id);

        const feesFinesDetails = await FeesFines.findAll({
          attributes: [
            "id",
            "start_day",
            "end_day",
            "amount",
            "type",
            "status",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: FeesTypes,
              through: { attributes: [] },
              attributes: [
                ["id", "fees_type_id"],
                ["title", "fees_type_title"],
              ],
              as: "feesTypes",
              required: false,
            },
          ],
          where: {
            id: feesFinesIds,
          },
          group: ["FeesFines.id", "feesTypes.id"],
          order: [["id", "ASC"]],
          subQuery: false,
        });

        // Format the response
        const formattedFeesFines = feesFinesDetails.map((fines) => {
          const feesFinesJson = fines.toJSON();
          return {
            fees_fine_id: feesFinesJson.id,
            start_day: feesFinesJson.start_day,
            end_day: feesFinesJson.end_day,
            amount: feesFinesJson.amount,
            type: feesFinesJson.type,
            status: feesFinesJson.status,
            created_at: feesFinesJson.created_at,
            updated_at: feesFinesJson.updated_at,
            fees_types: feesFinesJson.feesTypes
              ? feesFinesJson.feesTypes.map((feesType) => ({
                  fees_type_id: feesType.fees_type_id,
                  fees_type_title: feesType.fees_type_title,
                }))
              : [],
          };
        });

        const totalItems = count;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
          data: formattedFeesFines,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching fees discounts:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching fees discounts" });
    }
  },
  createFeesFine: async (req, res) => {
    const {
      start_day,
      end_day,
      amount,
      type,
      fees_types = [],
      status = true,
    } = req.body;

    if (
      !start_day ||
      !end_day ||
      !amount ||
      !type ||
      !Array.isArray(fees_types)
    ) {
      return res.status(400).json({
        error: "Missing required fields or invalid fees_types format",
      });
    }

    try {
      const duplicateCheck = await FeesFines.findOne({
        where: {
          start_day: start_day,
          end_day: end_day,
          amount: amount,
          type: type,
        },
      });
      if (duplicateCheck) {
        return res.status(409).json({
          error: "Fees Fine already exists.",
        });
      }
      const newFeesFine = await FeesFines.create({
        start_day: start_day,
        end_day: end_day,
        amount: amount,
        type: type,
        status: status,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const fine = newFeesFine;
      const fine_id = fine.id;

      const feesTypesInsertPromises = fees_types.map((feesTypeId) =>
        FeesCategoryFeesFines.create({
          fees_fine_id: fine_id,
          fees_category_id: feesTypeId,
        })
      );
      await Promise.all(feesTypesInsertPromises);
      res
        .status(201)
        .json({ message: "Fees fine created successfully", newFeesFine });
    } catch (error) {
      console.error("Error creating fees fine:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateFeesFine: async (req, res) => {
    const { id } = req.params;
    const {
      start_day,
      end_day,
      amount,
      type,
      fees_types = [],
      status = true,
    } = req.body;
    if (
      !start_day ||
      !end_day ||
      !amount ||
      !type ||
      !Array.isArray(fees_types)
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    try {
      const checkFines = await FeesFines.findByPk(id);
      if (!checkFines) {
        return res.status(404).json({ error: "Fees discount not found." });
      }
      await FeesFines.update(
        {
          start_day: start_day,
          end_day: end_day,
          amount: amount,
          type: type,
          status: status,
          updated_at: new Date(),
        },
        { where: { id: id } }
      );
      await FeesCategoryFeesFines.destroy({ where: { fees_fine_id: id } });
      const feesTypesInsertPromises = fees_types.map((feesTypeId) =>
        FeesCategoryFeesFines.create({
          fees_fine_id: id,
          fees_category_id: feesTypeId,
        })
      );
      await Promise.all(feesTypesInsertPromises);
      res.status(200).json({ message: "Fees discount updated successfully" });
    } catch (error) {
      console.error("Error updating fees discount:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteFeesFine: async (req, res) => {
    const { id } = req.params;
    try {
      const checkFines = await FeesFines.findByPk(id);
      if (!checkFines) {
        return res.status(404).json({ error: "Fees discount not found." });
      }
      await FeesCategoryFeesFines.destroy({ where: { fees_fine_id: id } });
      await FeesFines.destroy({ where: { id: id } });
      res.status(200).json({ message: "Fees discount deleted successfully." });
    } catch (error) {}
  },
};
