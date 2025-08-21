const logger = require("../../utils/logger");
const { pgPool } = require("../../pg_constant");
const { generateSlug } = require("../../utils/helpers");
const { Classroom } = require("../../models");
const { Op } = require("sequelize");

const getClassrooms = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  logger.log("info", "inside getClassrooms Controller");
  try {
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit" });
    }
    // const result = await pgPool.query(
    //   "SELECT * FROM class_rooms ORDER BY id LIMIT $1 OFFSET $2",
    //   [limit, offset]
    // );

    const { count: totalItems, rows: classrooms } =
      await Classroom.findAndCountAll({
        limit: limit,
        offset: offset,
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        order: [["id", "DESC"]],
      });

    // Count total entries (for pagination)
    // const countResult = await pgPool.query("SELECT COUNT(*) FROM class_rooms");
    // const totalItems = parseInt(countResult.rows[0].count);
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

    // res.json(classrooms.rows);
    return res.status(200).json({
      data: classrooms,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    logger.error("Error fetching classrooms:", error);
    res.status(500).json({ error: "Failed to fetch classrooms" });
  }
};

const createClassRoom = async (req, res) => {
  const { room_no, floor, capacity, type } = req.body;
  const slug = generateSlug(room_no);

  try {
    logger.log("info", "inside createClassRoom Controller");

    // Check if the classroom already exists
    // const checkQuery = `
    //   SELECT * FROM class_rooms
    //   WHERE LOWER(room_no) = LOWER($1) OR slug = $2;
    // `;

    const existingClassroom = await Classroom.findAll({
      where: {
        [Op.or]: [{ room_no: room_no }, { slug: slug }],
      },
    });

    // const checkValues = [room_no, slug];
    // const checkResult = await pgPool.query(checkQuery, checkValues);

    if (existingClassroom.length > 0) {
      return res
        .status(400)
        .json({ message: "Classroom with this title  already exists" });
    }

    // Insert new Classroom
    // const insertQuery = `
    //   INSERT INTO class_rooms (room_no, slug, floor, capacity, type, status, created_at, updated_at)
    //   VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    //   RETURNING *;
    // `;
    // const insertValues = [room_no, slug, floor, capacity, type, true];
    // const classroom = await pgPool.query(insertQuery, insertValues);

    const classroom = await Classroom.create({
      room_no: room_no,
      slug: slug,
      floor: floor,
      capacity: capacity,
      type: type,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // console.log("classroom", classroom);

    res.status(201).json(classroom);
  } catch (error) {
    logger.error("Error creating classroom:", error);
    res.status(500).json({ error: "Failed to create classroom" });
  }
};

const updateClassroom = async (req, res) => {
  const { id } = req.params;
  const { room_no, floor, capacity, type, status } = req.body;
  const slug = generateSlug(room_no);

  const requiredFields = { room_no, floor, capacity, type, status };

  if (
    Object.values(requiredFields).some((v) => v === undefined || v === null)
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // if (!room_no || !floor || !capacity || !type || !status) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  try {
    const existingClassroom = await Classroom.findByPk(id);
    if (!existingClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // const duplicateCheck = await pgPool.query(
    //   "SELECT id FROM class_rooms WHERE room_no = $1 AND  id != $2",
    //   [room_no, id]
    // );

    // if (duplicateCheck.rowCount > 0) {
    //   return res.status(409).json({
    //     error: "Another classroom with the same title already exists.",
    //   });
    // }

    const duplicateCheck = await Classroom.findOne({
      where: {
        room_no: room_no,
        id: { [Op.ne]: id },
      },
    });

    if (duplicateCheck) {
      return res.status(409).json({
        error: "Another classroom with the same title already exists.",
      });
    }

    // const query = `
    // UPDATE class_rooms
    // SET room_no = $1, slug = $2, floor = $3, capacity = $4, type = $5, status = $6, updated_at = NOW()
    // WHERE id = $7
    // RETURNING *;
    // `;
    // const values = [room_no, slug, floor, capacity, type, status, id];
    // const result = await pgPool.query(query, values);

    // if (result.rowCount === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: `Classroom not found with this id ${id}` });
    // }

    await existingClassroom.update({
      room_no,
      slug,
      floor,
      capacity,
      type,
      status,
      updated_at: new Date(),
    });

    res.status(200).json(existingClassroom);
  } catch (error) {
    logger.error("Error updating classroom:", error);
    res.status(500).json({ error: "Failed to update classroom" });
  }
};

const deleteClassroom = async (req, res) => {
  const { id } = req.params;
  try {
    const classroom = await Classroom.findByPk(id);

    if (!classroom) {
      return res
        .status(404)
        .json({ message: `Classroom not found to delete with this id ${id}` });
    }

    await classroom.destroy();
    // const query = `
    //   DELETE FROM class_rooms
    //   WHERE id = $1
    //   RETURNING *;
    // `;
    // const result = await pgPool.query(query, [id]);
    // if (result.rowCount === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: `Classroom not found to delete with this id ${id}` });
    // }
    res.status(200).json({ message: "Classroom deleted successfully" });
    // res.status(200).json({ message: "Classroom deleted successfully" });
  } catch (error) {
    logger.error("Error deleting classroom:", error);
    res.status(500).json({ error: "Failed to delete classroom" });
  }
};

module.exports = {
  getClassrooms,
  createClassRoom,
  updateClassroom,
  deleteClassroom,
};
