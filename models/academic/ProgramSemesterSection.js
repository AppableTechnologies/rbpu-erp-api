const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const ProgramSemesterSection = sequelize.define(
  "ProgramSemesterSection",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "program_semester_sections",
    timestamps: false,
  }
);

module.exports = ProgramSemesterSection;
