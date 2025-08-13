// controllers/fees/feestypes_controller.js
const { Op, Sequelize } = require("sequelize");
const FeesTypes = require("../../models/fees/FeesTypes");

// Get all fee types
const getFeesTypes = async (req, res) => {
     const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    // const limit = all ? null : parseInt(req.query.limit) || 10;
    const limit = !all && req.query.limit ? parseInt(req.query.limit) : 10;

    const offset = (page - 1) * (limit || 0);
  try {
    if (all) {
      const feesTypes = await FeesTypes.findAll({
        attributes: ["id", "title", "slug", "description", "status"],
        order: [["id", "ASC"]]
      });
        return res.status(200).json({ data: feesTypes });
    }else {
const { count: totalItems, rows: data } = 
        await FeesTypes.findAndCountAll({
            attributes: ["id", "title", "slug", "description", "status"],
            order: [["id", "ASC"]],
            limit,
            offset,
        });
    
        const totalPages = Math.ceil(totalItems / limit);
        return res.status(200).json({
            data,
            pagination: {
             totalItems,         
                totalPages,
                currentPage: page,
                limit       
            }
        });
        }
  
  } catch (error) {
    console.error("Error fetching fees types:", error);
    res.status(500).json({ error: "Failed to fetch fees types" });
  }
};

// Create a fee type
const createFeesType = async (req, res) => {
 const { title, description, status } = req.body;
   const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    if (!title || !slug) {
        return res.status(400).json({ error: "Title and slug are required" });
    }

  try {
    const existingFeeType = await FeesTypes.findOne({
      where: { slug },
    });
    if (existingFeeType) {
      return res.status(400).json({ error: "Fees type with this slug already exists" });
    }
    const newFeeType = await FeesTypes.create({
      title,
      slug,
      description,
      status: status ?? true,
      created_at: new Date(),
        updated_at: new Date(),
    });
    res.status(201).json(newFeeType);
  } catch (error) {
    console.error("Error creating fee type:", error);
    res.status(500).json({ error: "Failed to create fees type" });
  }
};

// Update a fee type
const updateFeesType = async (req, res) => {
      const { id } = req.params;
    const { title, description, status } = req.body;
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
      
    if (!title || !slug) {
        return res.status(400).json({ error: "Title  are required" });
    }
  try {
  
    const updateFeesType = await FeesTypes.update(
      {
        title,
        slug,
        description,
        status,
        updated_at: new Date(),
      },
      { where: { id } }
    );

    if (updateFeesType[0] === 0) {
      return res.status(404).json({ error: "Fees type not found" });
    }
 res.status(200).json({ message: "Fee Type updated successfully" });
 

  } catch (error) {
    console.error("Error updating fee type:", error);
    res.status(500).json({ error: "Failed to update fees type" });
  }
};

// Delete a fee type
const deleteFeesType = async (req, res) => {
    const { id } = req.params;

  try {
    const deleted = await FeesTypes.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: "Fees type deleted successfully" });
    } else {
      res.status(404).json({ error: "Fees type not found" });
    }
  } catch (error) {
    console.error("Error deleting fee type:", error);
    res.status(500).json({ error: "Failed to delete fees type" });
  }
};

module.exports = {
  getFeesTypes,
  createFeesType,
  updateFeesType,
  deleteFeesType,
};
