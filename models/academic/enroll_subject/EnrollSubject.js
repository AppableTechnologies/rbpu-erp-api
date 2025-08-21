const sequelize = require("../../../pg_constant");
const { DataTypes } = require("sequelize");

const EnrollSubject = sequelize.define(
  "EnrollSubject",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull:false,
      references:{
        model: 'programs',
        key:"id"
      }
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:'semesters',
        key:'id'
      }
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:'sections',
        key:'id'
      }
    },
    //   subject_id: {   // 🔥 add this field
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: { model: "subjects", key: "id" },
    // },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "enroll_subjects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = EnrollSubject;
