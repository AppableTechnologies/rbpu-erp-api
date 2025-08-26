const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const FeesDiscountsStatusTypes = sequelize.define("FeesDiscountsStatusTypes", {
  fees_discount_id_pk: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fees_discount_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "fees_discounts", key: "id" },
  },
  status_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "status_types", key: "id" },
  },
}, {
  tableName: "fees_discount_status_type",
  timestamps: false,
});

module.exports = FeesDiscountsStatusTypes;
