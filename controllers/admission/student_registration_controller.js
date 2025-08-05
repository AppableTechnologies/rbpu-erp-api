const logger = require("../../utils/logger");
const { pgPool } = require("../../pg_constant");

const path = require("path");
const fs = require("fs");
const { uploadDir } = require("../../middlewares/multer"); // adjust path
const { Op } = require("sequelize");
const Student = require("../../models/admission/Students");


const getStudents = async (req, res) => {`  `
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  logger.log("info", "inside getStudent Controller");
  try {
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: "Invalid page or limit" });
    }
       const { count: totalItems, rows: students } =
      await Student.findAndCountAll({
        limit: limit,
        offset: offset,
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        order: [["id", "DESC"]],
      });
    
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
      data: students,
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

//made changes in quer formation of student registration
const createStudent = async (req, res) => {
  try {
    logger.log("info", "inside createStudent Controller");

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
      present_address,
      permanent_province,
      permanent_district,
      permanent_address,
      gender,
      dob,
      phone,
      emergency_phone,
      mother_tongue,
      marital_status,
      blood_group,
      nationality,
      passport_no,
      school_name,
      school_exam_id,
      school_graduation_year,
      school_graduation_point,
      collage_name,
      collage_exam_id,
      collage_graduation_year,
      collage_graduation_point,
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
      school_graduation_field,
      school_transcript,
      school_certificate,
      collage_transcript,
      collage_certificate,
    } = req.body;
    // Save uploaded files with custom name (student_id based)
    const saveFile = (file, fieldName) => {
      if (!file) return null;
      const ext = path.extname(file.originalname);
      const filename = `${fieldName}-${student_id}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return filename;
    };

    const photo = saveFile(req.files?.photo?.[0], "photo");
    const signature = saveFile(req.files?.signature?.[0], "signature");

    // Check if student already exists
       const existingStudent = await Student.findAll({
      where: {
        [Op.or]: [{ student_id: student_id }, { registration_no: registration_no }],
      },
    });
     if (existingStudent.length > 0) {
      return res
        .status(400)
        .json({ message: "Student with this id or registration no. is already exists" });
    }

    const newStudent = await Student.create({ 
      student_id:student_id,
      registration_no:registration_no,
      program_id:program_id,
      admission_date:admission_date,
      first_name:first_name,
      last_name:last_name,
      father_name:father_name,
      mother_name:mother_name,
      email:email,
      email_verified_at:email_verified_at,
      password:password,
      password_text:password_text,
      present_province:present_province,
      present_district:present_district,
     // present_village:present_village,
      present_address:present_address,
      present_address:present_address,
      permanent_province:permanent_province,
      permanent_district:permanent_district,
     // permanent_village:permanent_village,
      permanent_address:permanent_address,
      gender:gender,
      dob:dob,
      phone:phone,
      emergency_phone:emergency_phone,
      mother_tongue:mother_tongue,
      marital_status:marital_status,
      blood_group:blood_group,
      nationality:nationality,
      //national_id:national_id,

    passport_no:passport_no,
    school_name:school_name,
    school_exam_id:school_exam_id,
    school_graduation_year:school_graduation_year,
    school_graduation_point:school_graduation_point ,
    collage_name:collage_name,
    collage_exam_id:collage_exam_id,
    collage_graduation_year:collage_graduation_year,
    collage_graduation_point:collage_graduation_point,
    photo:photo,
    signature:signature,
    login:login,
    status:status,
    is_transfer:is_transfer,
    remember_token:remember_token,
    created_by:created_by,
    updated_by:updated_by,
    father_occupation:father_occupation,
    mother_occupation:mother_occupation,
    father_photo:father_photo,
    mother_photo:mother_photo,
    country:country,
    religion:religion,
    caste:caste,
    school_graduation_field:school_graduation_field,
    collage_graduation_roll:collage_graduation_roll,
    school_transcript:school_transcript,
    school_certificate:school_certificate,
    collage_transcript:collage_transcript,
    collage_certificate:collage_certificate,
    });

/*    const insertQuery = `
  INSERT INTO students (
    -- Student Identification
    student_id,
    registration_no,
    batch_id,
    program_id,
    admission_date,
    
    -- Personal Information
    first_name,
    last_name,
    father_name,
    mother_name,
    email,
    email_verified_at,
    password,
    password_text,
    
    -- Present Address
    present_province,
    present_district,
    present_address,
    
    -- Permanent Address
    permanent_province,
    permanent_district,
    permanent_address,
    
    -- Personal Details
    gender,
    dob,
    phone,
    emergency_phone,
    mother_tongue,
    marital_status,
    blood_group,
    nationality,
    passport_no,
    
    -- Educational Background
    school_name,
    school_exam_id,
    school_graduation_year,
    school_graduation_point,
    school_graduation_field,
    school_transcript,
    school_certificate,
    
    collage_name,
    collage_exam_id,
    collage_graduation_year,
    collage_graduation_point,
    collage_transcript,
    collage_certificate,
    
    -- Family Information
    father_occupation,
    mother_occupation,
    father_photo,
    mother_photo,
    
    -- Additional Information
    country,
    religion,
    caste,
    
    -- System Fields
    photo,
    signature,
    login,
    status,
    is_transfer,
    remember_token,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  VALUES (
    $1,  $2,  $3,  $4,  $5,
    $6,  $7,  $8,  $9,  $10,
    $11, $12, $13, $14, $15,
    $16, $17, $18, $19, $20,
    $21, $22, $23, $24, $25,
    $26, $27, $28, $29, $30,
    $31, $32, $33, $34, $35,
    $36, $37, $38, $39, $40,
    $41, $42, $43, $44, $45,
    $46, $47, $48, $49, $50,
    $51, $52, $53, $54, $55,
    
    NOW(), NOW()
  )
  RETURNING *;
`;

const insertValues = [
  // Student Identification
  student_id,
  registration_no,
  batch_id,
  program_id,
  admission_date,
  
  // Personal Information
  first_name,
  last_name,
  father_name,
  mother_name,
  email,
  email_verified_at,
  password,
  password_text,
  
  // Present Address
  present_province,
  present_district,
  present_address,
  
  // Permanent Address
  permanent_province,
  permanent_district,
  permanent_address,
  
  // Personal Details
  gender,
  dob,
  phone,
  emergency_phone,
  mother_tongue,
  marital_status,
  blood_group,
  nationality,
  passport_no,
  
  // Educational Background
  school_name,
  school_exam_id,
  school_graduation_year,
  school_graduation_point,
  school_graduation_field,
  school_transcript,
  school_certificate,
  
  collage_name,
  collage_exam_id,
  collage_graduation_year,
  collage_graduation_point,
  collage_transcript,
  collage_certificate,
  
  // Family Information
  father_occupation,
  mother_occupation,
  father_photo,
  mother_photo,
  
  // Additional Information
  country,
  religion,
  caste,
  
  // System Fields
  photo,
  signature,
  login,
  status,
  is_transfer,
  remember_token,
  created_by,
  updated_by
];


    const result = await pgPool.query(insertQuery, insertValues);
    res.status(201).json(result.rows[0]);*/
    res.status(201).json(newStudent);
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
    /*
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
*/
 const existingStudent = await Student.findByPk(id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    await existingStudent.update({
      phone,
      email,
      present_address,
      permanent_address,
      emergency_phone,
      updated_by,
      updated_at: new Date(),
    });

    res.status(200).json(existingStudent);
  } catch (error) {
    logger.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
};


const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    /*
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
    */
       const student = await Student.findByPk(id);

    if (!student) {
      return res
        .status(404)
        .json({ message: `Student not found to delete with this id ${id}` });
    }

    await student.destroy();

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
