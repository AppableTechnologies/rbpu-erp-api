const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");

const Submenu = sequelize.define(
  "Submenu",
  {
    submenu_id_pk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_id_fk: DataTypes.INTEGER,
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    submenu_icon: DataTypes.STRING(50),
    path: DataTypes.STRING(255),

    submenu_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_button: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: DataTypes.STRING,
  },
  {
    tableName: "submenus",
    timestamps: false,
  }
);

module.exports = Submenu;
