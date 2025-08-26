const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const FeesDiscounts = sequelize.define(
  "FeesDiscounts",
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
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:"status_types",
            key:"id",
        }
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
    tableName: "fees_discounts",
    timestamps: false,
  }
);
module.exports = FeesDiscounts;
