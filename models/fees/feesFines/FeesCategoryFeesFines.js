const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../pg_constant");

const FeesCategoryFeesFines = sequelize.define(
  "FeesCategoryFeesFines",
  {
    fees_category_id_pk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fees_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "fees_categories", key: "id" },
    },
    fees_fine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "fees_fines", key: "id" },
    },
  },
  {
    tableName: "fees_category_fees_fine",
    timestamps: false,
  }
);

module.exports = FeesCategoryFeesFines;
