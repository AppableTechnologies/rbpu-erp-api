const { DataTypes } = require("sequelize");
const sequelize = require("../../pg_constant");

const Menu = sequelize.define(
  "Menu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    icon: DataTypes.STRING(50),
    path: DataTypes.STRING(255),

    menu_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    role_id_fk: DataTypes.INTEGER,
    type: DataTypes.STRING(100),
    slicedpath: DataTypes.STRING(100),
    active: DataTypes.BOOLEAN,
  },
  {
    tableName: "menus",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Menu;
