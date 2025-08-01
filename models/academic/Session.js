const { DataTypes } = require("sequelize");
const sequelize = require("../../pg_constant");

const Session = sequelize.define(
  "Session",
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
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    current: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "sessions",
    timestamps: false, // Set to true if Sequelize should handle createdAt/updatedAt automatically
  }
);

module.exports = Session;
