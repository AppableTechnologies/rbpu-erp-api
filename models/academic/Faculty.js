const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const Faculty = sequelize.define(
  "Faculty",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    shortcode: {
      type: DataTypes.STRING(255), // correct type
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // matches DB default
    },
  },
  {
    tableName: "faculties",
    timestamps: true,
    createdAt: "created_at", // map to snake_case DB field
    updatedAt: "updated_at",
  }
);

module.exports = Faculty;
