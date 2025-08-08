const { DataTypes } = require("sequelize");
const sequelize = require("../../pg_constant");


const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  registration_no: {
    type: DataTypes.STRING(191),
  },
  batch_id: {
    type: DataTypes.INTEGER,
  },
  program_id: {
    type: DataTypes.INTEGER,
  },
  admission_date: {
    type: DataTypes.DATEONLY,
  },
  first_name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  father_name: {
    type: DataTypes.STRING(191),
  },
  mother_name: {
    type: DataTypes.STRING(191),
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  email_verified_at: {
    type: DataTypes.DATE,
  },
  password: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  password_text: {
    type: DataTypes.TEXT,
  },
  present_province: {
    type: DataTypes.INTEGER,
  },
  present_district: {
    type: DataTypes.INTEGER,
  },
  present_village: {
    type: DataTypes.TEXT,
  },
  present_address: {
    type: DataTypes.TEXT,
  },
  permanent_province: {
    type: DataTypes.INTEGER,
  },
  permanent_district: {
    type: DataTypes.INTEGER,
  },
  permanent_village: {
    type: DataTypes.TEXT,
  },
  permanent_address: {
    type: DataTypes.TEXT,
  },
  gender: {
    type: DataTypes.TEXT,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(191),
  },
  emergency_phone: {
    type: DataTypes.STRING(191),
  },
  mother_tongue: {
    type: DataTypes.STRING(191),
  },
  marital_status: {
    type: DataTypes.INTEGER,
  },
  blood_group: {
    type: DataTypes.TEXT,
  },
  nationality: {
    type: DataTypes.STRING(191),
  },
  national_id: {
    type: DataTypes.STRING(191),
  },
  passport_no: {
    type: DataTypes.STRING(191),
  },
  school_name: {
    type: DataTypes.TEXT,
  },
  school_exam_id: {
    type: DataTypes.STRING(191),
  },
  school_graduation_year: {
    type: DataTypes.STRING(191),
  },
  school_graduation_point: {
    type: DataTypes.STRING(191),
  },
  collage_name: {
    type: DataTypes.TEXT,
  },
  collage_exam_id: {
    type: DataTypes.STRING(191),
  },
  collage_graduation_year: {
    type: DataTypes.STRING(191),
  },
  collage_graduation_point: {
    type: DataTypes.STRING(191),
  },
  photo: {
    type: DataTypes.TEXT,
  },
  signature: {
    type: DataTypes.TEXT,
  },
  login: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.TEXT,
  },
  is_transfer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  remember_token: {
    type: DataTypes.STRING(100),
  },
  created_by: {
    type: DataTypes.BIGINT,
  },
  updated_by: {
    type: DataTypes.BIGINT,
  },
  created_at: {
    type: DataTypes.DATE,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
  father_occupation: {
    type: DataTypes.STRING(191),
  },
  mother_occupation: {
    type: DataTypes.STRING(191),
  },
  father_photo: {
    type: DataTypes.TEXT,
  },
  mother_photo: {
    type: DataTypes.TEXT,
  },
  country: {
    type: DataTypes.STRING(191),
  },
  religion: {
    type: DataTypes.STRING(191),
  },
  caste: {
    type: DataTypes.STRING(191),
  },
  school_graduation_field: {
    type: DataTypes.STRING(191),
  },
  collage_graduation_roll: {
    type: DataTypes.STRING(191),
  },
  school_transcript: {
    type: DataTypes.STRING(191),
  },
  school_certificate: {
    type: DataTypes.STRING(191),
  },
  collage_transcript: {
    type: DataTypes.STRING(191),
  },
  collage_certificate: {
    type: DataTypes.STRING(191),
  }
}, {
  tableName: 'students',
  timestamps: false, // Set to true if you want Sequelize to auto-manage createdAt/updatedAt
  
});

module.exports = Student;