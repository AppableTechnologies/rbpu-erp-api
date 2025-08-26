const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const Subject = sequelize.define(
  "Subject",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    credit_hour: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subject_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_marks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    passing_marks: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "subjects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Subject;
