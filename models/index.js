const Classroom = require("./academic/Classroom.js");
const Program = require("./academic/Program.js");
const ProgramSession = require("./academic/ProgramSession.js");

const Session = require("./academic/Session.js");
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

Session.belongsToMany(Program, {
  through: ProgramSession,
  foreignKey: "session_id",
  otherKey: "program_id",
});

Program.belongsToMany(Session, {
  through: ProgramSession,
  foreignKey: "program_id",
  otherKey: "session_id",
});

// Optional reverse relations (useful for includes)
Session.hasMany(ProgramSession, { foreignKey: "session_id" });
Program.hasMany(ProgramSession, { foreignKey: "program_id" });

ProgramSession.belongsTo(Session, { foreignKey: "session_id" });
ProgramSession.belongsTo(Program, { foreignKey: "program_id" });

module.exports = {
  Menu,
  Submenu,
  Classroom,
  Program,
  ProgramSession,
  Session,
};
