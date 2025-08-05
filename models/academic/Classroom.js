const { DataTypes } = require("sequelize");
const sequelize = require("../../pg_constant");

const Classroom = sequelize.define(
  "Classroom",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_no: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    floor: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.STRING(191),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(191),
      allowNull: true,
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
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "class_rooms",
    timestamps: false, // manually handled created_at and updated_at
   // underscored: true, // for snake_case DB columns
  }
);

module.exports = Classroom;
