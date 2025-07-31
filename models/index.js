// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../pg_constant.js");

const Classroom = require("./academic/Classroom.js");
const Menu = require("./common/Menus.js");
const Submenu = require("./common/SubMenus.js");

// Association
Menu.hasMany(Submenu, {
  foreignKey: "menu_id_fk",
  as: "submenus",
});
Submenu.belongsTo(Menu, {
  foreignKey: "menu_id_fk",
});

module.exports = {
  Menu,
  Submenu,
  Classroom,
};
