const { Op } = require("sequelize");
const Faculty = require("../../models/academic/Faculty");
const { pgPool } = require("../../pg_constant");

module.exports = {
  getFaculties: async (req, res) => {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    // const limit = all ? null : parseInt(req.query.limit) || 10;
    const limit = !all && req.query.limit ? parseInt(req.query.limit) : 10;

    const offset = (page - 1) * (limit || 0);

    try {
      // let dataQuery, dataParams;
      if (all) {
        const faculties = await Faculty.findAll({
          attributes: ["id", "title", "slug", "shortcode", "status"],
          order: [["id", "ASC"]]
        });
        

        return res.status(200).json({ data: faculties });

        // dataQuery = `
        //   SELECT id, title, slug, shortcode, status
        //   FROM faculties
        //   ORDER BY id ASC;
        // `;
        // dataParams = [];
      }

      // else {
      //   dataQuery = `
      //     SELECT id, title, slug, shortcode, status
      //     FROM faculties
      //     ORDER BY id ASC
      //     LIMIT $1 OFFSET $2;
      //   `;
      //   dataParams = [limit, offset];
      // }

      // const dataResult = await pgPool.query(dataQuery, dataParams);

      // if (all) {
      //   return res.status(200).json({ data: dataResult.rows });
      // }

      const { count: totalItems, rows: data } = 
      await Faculty.findAndCountAll({
        attributes: ["id", "title", "slug", "shortcode", "status"],
        order: [["id", "ASC"]],
        limit,
        offset,
      });

      // const countQuery = `SELECT COUNT(*) FROM faculties;`;
      // const countResult = await pgPool.query(countQuery);
      // const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        data,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error fetching faculties:", error);
      return res
        .status(500)
        .json({ message: "Server error while fetching faculties" });
    }
  },

  createFaculty: async (req, res) => {
    const { title, shortcode } = req.body;
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    try {
      // 1. Check if title or slug already exists
    //   const checkQuery = `
    //   SELECT * FROM faculties 
    //   WHERE LOWER(title) = LOWER($1) OR slug = $2;
    // `;
    const existingFaculty = await Faculty.findAll({
      where: {
        [Op.or]: [{ title: title }, { slug: slug }],
      },
    })
      // const checkValues = [title, slug];
      // const checkResult = await pgPool.query(checkQuery, checkValues);

      if (existingFaculty.length > 0) {
        return res
          .status(400)
          .json({ message: "Faculty with this title or slug already exists" });
      }

      // 2. Insert new faculty if no duplicates
    //   const insertQuery = `
    //   INSERT INTO faculties (title, slug, shortcode, status, created_at, updated_at)
    //   VALUES ($1, $2, $3, $4, NOW(), NOW())
    //   RETURNING *;
    // `;
    const createFaculty = await Faculty.create({
     title,
     slug,
     shortcode,
     status: true,
     created_at: new Date(),
     updated_at: new Date(),
    })
      // const insertValues = [title, slug, shortcode || null, true];
      // const result = await pgPool.query(insertQuery, insertValues);

      res.status(201).json(createFaculty);
    }catch (err) {
      console.error("Error creating faculty:", err);
      res.status(500).json({ message: "Server error while creating faculty" });
}

  },

  updateFaculty: async (req, res) => {
    const { id } = req.params;
    const { title, shortcode, status } = req.body;
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    if (!title || (shortcode && typeof shortcode !== "string")) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // const duplicateCheck = await pgPool.query(
    //   "SELECT id FROM faculties WHERE title = $1 AND  id != $2",
    //   [title, id]
    // );

    // if (duplicateCheck.rowCount > 0) {
    //   return res.status(409).json({
    //     error: "Another faculty with the same title already exists.",
    //   });
    // }
    

    try {
     

      const duplicateCheck = await Faculty.findOne({
      where: {
        title: title,
        id: { [Op.ne]: id },
      },
    })

    if (duplicateCheck) {
      return res.status(409).json({
        error: "Another faculty with the same title already exists.",
      });
    }
    
      // const query = `
      //   UPDATE faculties
      //   SET title = $1, slug = $2, shortcode = $3, status = $4, updated_at = NOW()
      //   WHERE id = $5
      //   RETURNING *;
      // `;
      // const values = [title, slug, shortcode || null, status, id];
      // const result = await pgPool.query(query, values);

      const result = await Faculty.update(
        {
          title,
          slug,
          shortcode,
          status,
          updated_at: new Date(),
        },
        {
          where: {
            id,
          },
        }
      );

      if (result[0] === 0) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      res.status(200).json({ message: "Faculty updated successfully" });

      
    } catch (err) {
      console.error("Error updating faculty:", err);
      res.status(500).json({ message: "Server error while updating faculty" });
    }
  },

  deleteFaculty: async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCount = await Faculty.destroy({
      where: { id },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (err) {
    console.error("Error deleting faculty:", err);
    res.status(500).json({ message: "Server error while deleting faculty" });
  }
},

};
