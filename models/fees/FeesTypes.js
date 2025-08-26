const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const FeesTypes = sequelize.define(
  "FeesTypes",
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
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true, 
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, 
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "fees_categories",
    timestamps: false, 
    underscored: true, 
  }
);

module.exports = FeesTypes;
