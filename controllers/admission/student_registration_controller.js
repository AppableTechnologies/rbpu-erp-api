const logger = require("../../utils/logger");
const { pgPool } = require("../../pg_constant");

const getStudents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  logger.log("info", "inside getStudent Controller");
  try {
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit" });
    }
    const result = await pgPool.query(
      "SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Count total entries (for pagination)
    const countResult = await pgPool.query("SELECT COUNT(*) FROM students");
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
    res.json({
      data: result.rows,
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

const createStudent = async (req, res) => {
  const {
    student_id,
    registration_no,
    batch_id,
    program_id,
    admission_date,
    first_name,
    last_name,
    father_name,
    mother_name,
    email,
    email_verified_at,
    password,
    password_text,
    present_province,
    present_district,
    present_village,
    present_address,
    permanent_province,
    permanent_district,
    permanent_village,
    permanent_address,
    gender,
    dob,
    phone,
    emergency_phone,
    mother_tongue,
    marital_status,
    blood_group,
    nationality,
    national_id,
    passport_no,
    school_name,
    school_exam_id,
    school_graduation_year,
    school_graduation_roll,
    collage_name,
    collage_exam_id,
    collage_graduation_year,
    collage_graduation_roll,
    photo,
    signature,
    login,
    status,
    is_transfer,
    remember_token,
    created_by,
    updated_by,
    father_occupation,
    mother_occupation,
    father_photo,
    mother_photo,
    country,
    religion,
    caste,
    school_graduation_certificate,
    collage_graduation_certificate,
    school_transcript,
    school_certificate,
    collage_transcript,
    collage_certificate
  } = req.body;

  try {
    logger.log("info", "inside createStudent Controller");

    const checkQuery = `SELECT * FROM students WHERE student_id = $1;`;
    const checkResult = await pgPool.query(checkQuery, [student_id]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Student with this ID already exists" });
    }

    const insertQuery = `
      INSERT INTO students (
        student_id, registration_no, batch_id, program_id, admission_date,
        first_name, last_name, father_name, mother_name, email, email_verified_at,
        password, password_text, present_province, present_district, present_village,
        present_address, permanent_province, permanent_district, permanent_village,
        permanent_address, gender, dob, phone, emergency_phone, mother_tongue,
        marital_status, blood_group, nationality, national_id, passport_no,
        school_name, school_exam_id, school_graduation_year, school_graduation_roll,
        collage_name, collage_exam_id, collage_graduation_year, collage_graduation_roll,
        photo, signature, login, status, is_transfer, remember_token,
        created_by, updated_by, created_at, updated_at, father_occupation,
        mother_occupation, father_photo, mother_photo, country, religion, caste,
        school_graduation_certificate, collage_graduation_certificate, school_transcript,
        school_certificate, collage_transcript, collage_certificate
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31,
        $32, $33, $34, $35,
        $36, $37, $38, $39,
        $40, $41, $42, $43, $44, $45,
        $46, $47, NOW(), NOW(), $48,
        $49, $50, $51, $52, $53, $54,
        $55, $56, $57,
        $58, $59, $60
      )
      RETURNING *;
    `;

    const insertValues = [
      student_id, registration_no, batch_id, program_id, admission_date,
      first_name, last_name, father_name, mother_name, email, email_verified_at,
      password, password_text, present_province, present_district, present_village,
      present_address, permanent_province, permanent_district, permanent_village,
      permanent_address, gender, dob, phone, emergency_phone, mother_tongue,
      marital_status, blood_group, nationality, national_id, passport_no,
      school_name, school_exam_id, school_graduation_year, school_graduation_roll,
      collage_name, collage_exam_id, collage_graduation_year, collage_graduation_roll,
      photo, signature, login, status, is_transfer, remember_token,
      created_by, updated_by, father_occupation,
      mother_occupation, father_photo, mother_photo, country, religion, caste,
      school_graduation_certificate, collage_graduation_certificate, school_transcript,
      school_certificate, collage_transcript, collage_certificate
    ];

    const result = await pgPool.query(insertQuery, insertValues);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
};


const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    phone,
    email,
    present_address,
    permanent_address,
    emergency_phone,
    updated_by
  } = req.body;

  try {
    const query = `
      UPDATE students
      SET 
        phone = $1,
        email = $2,
        present_address = $3,
        permanent_address = $4,
        emergency_phone = $5,
        updated_by = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      phone,
      email,
      present_address,
      permanent_address,
      emergency_phone,
      updated_by,
      id
    ];

    const result = await pgPool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Student not found with id ${id}` });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    logger.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};


const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      DELETE FROM students
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pgPool.query(query, [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: `student not found to delete with this id ${id}` });
    }
    res.status(200).json({ message: "student deleted successfully" });
  } catch (error) {
    logger.error("Error deleting student:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
