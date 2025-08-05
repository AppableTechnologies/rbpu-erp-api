const Classroom = require("./academic/Classroom.js");
const Faculty = require("./academic/Faculty.js");
const Program = require("./academic/Program.js");
const ProgramSession = require("./academic/ProgramSession.js");
const Batch = require("./academic/batch/Batch.js");
const BatchProgram = require("./academic/batch/BatchProgram.js");
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

// Batch-Program many-to-many relationship
Batch.belongsToMany(Program, {
  through: BatchProgram,
  foreignKey: "batch_id",
  otherKey: "program_id",
});

Program.belongsToMany(Batch, {
  through: BatchProgram,
  foreignKey: "program_id",
  otherKey: "batch_id",
});

// Optional: If you need direct access to the join table
Batch.hasMany(BatchProgram, { foreignKey: "batch_id" });
Program.hasMany(BatchProgram, { foreignKey: "program_id" });
BatchProgram.belongsTo(Batch, { foreignKey: "batch_id" });
BatchProgram.belongsTo(Program, { foreignKey: "program_id" });

// Optional reverse relations (useful for includes)
Session.hasMany(ProgramSession, { foreignKey: "session_id" });
Program.hasMany(ProgramSession, { foreignKey: "program_id" });

ProgramSession.belongsTo(Session, { foreignKey: "session_id" });
ProgramSession.belongsTo(Program, { foreignKey: "program_id" });

Program.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
Faculty.hasMany(Program, { foreignKey: "faculty_id", as: "programs" });

module.exports = {
  Menu,
  Submenu,
  Classroom,
  Program,
  Faculty,
  ProgramSession,
  Session,
  Batch,
  BatchProgram,
};
