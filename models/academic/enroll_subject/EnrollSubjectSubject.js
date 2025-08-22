const sequelize = require("../../../pg_constant");
const { DataTypes } = require("sequelize");

const EnrollSubjectSubject = sequelize.define(
  "EnrollSubjectSubject",
  {
    enroll_subject_id_pk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    enroll_subject_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "enroll_subjects",
        key: "id",
      },
    },
    subject_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "subjects",
        key: "id",
      },
    },
  },
  {
    tableName: "enroll_subject_subject",
    timestamps: false,

  }
);

module.exports = EnrollSubjectSubject;
