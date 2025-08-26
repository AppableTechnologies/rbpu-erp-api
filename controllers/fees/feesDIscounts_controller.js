const {
  StatusTypes,
  FeesDiscounts,
  FeesDiscountsStatusTypes,
  FeesTypes,
  FeesCategoryFeesDiscount,
} = require("../../models");
const { pgPool } = require("../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
 getFeesDiscounts: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? null : parseInt(req.query.limit) || 10;
    const offset = (page - 1) * (limit || 0);

    try {
        if (all) {
            const feesDiscounts = await FeesDiscounts.findAll({
                attributes: [
                    'id',
                    'title',
                    'start_date',
                    'end_date',
                    'amount',
                    'type',
                    'status',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    {
                        model: StatusTypes,
                        through: { attributes: [] },
                        attributes: [
                            ['id', 'status_type_id'],
                            ['title', 'status_type_title']
                        ],
                        as: 'typeDetails',
                        required: false
                    },
                    {
                        model: FeesTypes,
                        through: { attributes: [] },
                        attributes: [
                            ['id', 'fees_type_id'],
                            ['title', 'fees_type_title']
                        ],
                        as: 'feesTypes',
                        required: false
                    }
                ],
                group: ['FeesDiscounts.id', 'typeDetails.id', 'feesTypes.id'],
                order: [['id', 'ASC']],
                subQuery: false
            });

            const formattedFeesDiscounts = feesDiscounts.map(discount => {
                const discountJson = discount.toJSON();
                return {
                    fees_discount_id: discountJson.id,
                    title: discountJson.title,
                    start_date: discountJson.start_date,
                    end_date: discountJson.end_date,
                    amount: discountJson.amount,
                    type: discountJson.type,
                    status: discountJson.status,
                    created_at: discountJson.created_at,
                    updated_at: discountJson.updated_at,
                    status_types: discountJson.typeDetails ? discountJson.typeDetails.map(statusType => ({
                        status_type_id: statusType.status_type_id,
                        status_type_title: statusType.status_type_title
                    })) : [],
                    fees_types: discountJson.feesTypes ? discountJson.feesTypes.map(feesType => ({
                        fees_type_id: feesType.fees_type_id,
                        fees_type_title: feesType.fees_type_title
                    })) : []
                };
            });

            return res.status(200).json({ data: formattedFeesDiscounts });
        } else {
            // For paginated fees discounts
            const { count, rows: feesDiscounts } = await FeesDiscounts.findAndCountAll({
                attributes: ['id'],
                order: [['id', 'ASC']],
                limit,
                offset,
                distinct: true
            });

            if (feesDiscounts.length === 0) {
                return res.status(200).json({
                    data: [],
                    pagination: {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: page,
                        limit
                    }
                });
            }

            const feesDiscountIds = feesDiscounts.map(discount => discount.id);

            const feesDiscountDetails = await FeesDiscounts.findAll({
                attributes: [
                    'id',
                    'title',
                    'start_date',
                    'end_date',
                    'amount',
                    'type',
                    'status',
                    'created_at',
                    'updated_at'
                ],
                include: [
                    {
                        model: StatusTypes,
                        through: { attributes: [] },
                        attributes: [
                            ['id', 'status_type_id'],
                            ['title', 'status_type_title']
                        ],
                        as: 'typeDetails',
                        required: false
                    },
                    {
                        model: FeesTypes,
                        through: { attributes: [] },
                        attributes: [
                            ['id', 'fees_type_id'],
                            ['title', 'fees_type_title']
                        ],
                        as: 'feesTypes',
                        required: false
                    }
                ],
                where: {
                    id: feesDiscountIds
                },
                group: ['FeesDiscounts.id', 'typeDetails.id', 'feesTypes.id'],
                order: [['id', 'ASC']],
                subQuery: false
            });

            // Format the response
            const formattedFeesDiscounts = feesDiscountDetails.map(discount => {
                const discountJson = discount.toJSON();
                return {
                    fees_discount_id: discountJson.id,
                    title: discountJson.title,
                    start_date: discountJson.start_date,
                    end_date: discountJson.end_date,
                    amount: discountJson.amount,
                    type: discountJson.type,
                    status: discountJson.status,
                    created_at: discountJson.created_at,
                    updated_at: discountJson.updated_at,
                    status_types: discountJson.typeDetails ? discountJson.typeDetails.map(statusType => ({
                        status_type_id: statusType.status_type_id,
                        status_type_title: statusType.status_type_title
                    })) : [],
                    fees_types: discountJson.feesTypes ? discountJson.feesTypes.map(feesType => ({
                        fees_type_id: feesType.fees_type_id,
                        fees_type_title: feesType.fees_type_title
                    })) : []
                };
            });

            const totalItems = count;
            const totalPages = Math.ceil(totalItems / limit);

            return res.status(200).json({
                data: formattedFeesDiscounts,
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
        return res.status(500).json({ message: "Server error while fetching fees discounts" });
    }
},
  createFeesDiscount: async (req, res) => {
    const {
      title,
      start_date,
      end_date,
      amount,
      type,
      status_types=[],
      fees_types = [],
      status = true,
    } = req.body;

    if (
      !title ||
      !start_date ||
      !end_date ||
      !amount ||
      !type ||
      !Array.isArray(status_types) ||
      !Array.isArray(fees_types)
    ) {
      return res.status(400).json({
        error: "Missing required fields or invalid fees_types format",
      });
    }

    try {
      const duplicateCheck = await FeesDiscounts.findOne({
        where: {
          title: title,
        },
      });
      if (duplicateCheck) {
        return res.status(409).json({
          error: "A fees discount with the same title already exists.",
        });
      }
      const newDiscount = await FeesDiscounts.create({
        title : title,
        start_date : start_date,
        end_date : end_date,
        amount : amount,
        type : type,
        status : status,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const discount = newDiscount;
      const discount_id = discount.id;
      const typeInsertPromises = status_types.map((statusTypeId) =>
        FeesDiscountsStatusTypes.create({
          fees_discount_id: discount_id,
          status_type_id: statusTypeId,
        })
      );
      await Promise.all(typeInsertPromises);
      const feesTypesInsertPromises = fees_types.map((feesTypeId) =>
        FeesCategoryFeesDiscount.create({
          fees_discount_id: discount_id,
          fees_category_id: feesTypeId,
        })
      );
      await Promise.all(feesTypesInsertPromises);
      res
        .status(201)
        .json({ message: "Fees discount created successfully", newDiscount });
    } catch (error) {
      console.error("Error creating fees discount:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateFeesDiscount: async (req, res) => {
    const {id} = req.params;
    const {
      title,
      start_date,
      end_date,
      amount,
      type,
      status_types=[],   
      fees_types = [],
      status = true,
    } = req.body;
    if (
      !title ||
      !start_date ||
      !end_date ||
      !amount ||
      !type ||
      !Array.isArray(status_types) ||
      !Array.isArray(fees_types)
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    try {
      const checkDiscount = await FeesDiscounts.findByPk(id);
      if (!checkDiscount) {
        return res.status(404).json({ error: "Fees discount not found." });
      }
      await FeesDiscounts.update(
        {
          title : title,
          start_date : start_date,
          end_date : end_date,
          amount : amount,
          type : type,
          status : status,
          updated_at: new Date(),
        },
        { where: { id: id } }
      );
      await FeesDiscountsStatusTypes.destroy({ where: { fees_discount_id: id } });
      const typeInsertPromises = status_types.map((statusTypeId) =>
        FeesDiscountsStatusTypes.create({
          fees_discount_id: id,
          status_type_id: statusTypeId,
        })
      );
      await Promise.all(typeInsertPromises);
      await FeesCategoryFeesDiscount.destroy({ where: { fees_discount_id: id } });
      const feesTypesInsertPromises = fees_types.map((feesTypeId) =>
        FeesCategoryFeesDiscount.create({
          fees_discount_id: id,
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
  deleteFeesDiscount: async (req, res) => {
    const {id}= req.params;
    try {
    const  checkDiscount = await FeesDiscounts.findByPk(id);
    if(!checkDiscount){
      return res.status(404).json({error:"Fees discount not found."});  
    }
    await FeesDiscountsStatusTypes.destroy({ where: { fees_discount_id: id } });
    await FeesCategoryFeesDiscount.destroy({ where: { fees_discount_id: id } });
    await FeesDiscounts.destroy({where:{id:id}});
    res.status(200).json({message:"Fees discount deleted successfully."});
    } catch (error) {
      
    }
  },
};
