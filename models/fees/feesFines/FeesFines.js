const { DataTypes } = require("sequelize");
const {sequelize} = require("../../../pg_constant");

const FeesFines = sequelize.define(
  "FeesFines",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    start_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    end_day: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
   
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type:{
        type:DataTypes.INTEGER,
        allowNull:false,
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
    tableName: "fees_fines",
    timestamps: false,
  }
);
module.exports = FeesFines;
