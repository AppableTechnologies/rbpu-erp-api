const { DataTypes } = require("sequelize");
const sequelize = require("../../pg_constant");

const Program = sequelize.define(
  "Program",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    shortcode: {
      type: DataTypes.STRING(191),
    },
    registration: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "programs",
    timestamps: false,
  }
);

module.exports = Program;
