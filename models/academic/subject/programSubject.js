const { DataTypes } = require("sequelize");
const sequelize = require("../../../pg_constant");

const ProgramSubject = sequelize.define(
  "ProgramSubject",
  {
    prog_sub_pk_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "programs", key: "id" },
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "subject", key: "id" },
    },
  },
  {
    tableName: "program_subject",
    timestamps: false,
  }
);

module.exports = ProgramSubject;
