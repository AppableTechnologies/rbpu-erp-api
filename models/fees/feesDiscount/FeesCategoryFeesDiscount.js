const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const FeesCategoryFeesDiscount = sequelize.define("FeesCategoryFeesDiscount", {
  fees_discount_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "fees_discounts", key: "id" },
  },
  fees_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "fees_categories", key: "id" },
  },
}, {
  tableName: "fees_category_fees_discount",
  timestamps: false,
});

module.exports = FeesCategoryFeesDiscount;