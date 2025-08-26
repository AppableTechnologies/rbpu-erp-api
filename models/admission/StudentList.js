const { DataTypes } = require("sequelize");
const {sequelize} = require("../../pg_constant");
const Student = require("./Students.js");
const Faculty = require("../academic/Faculty");
const Program = require("../academic/Program");
const Session = require("../academic/Session.js");
const Semester = require("../academic/semester/Semester.js");
const Section = require("../academic/Section.js");
const StatusTypes = require("./StatusTypes.js");
const StudentList = sequelize.define("student_list", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.BIGINT,
    references: {
      model: Student,
      key: "id",
    },
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Faculty,
      key: "id",
    },
  },
  program_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Program,
      key: "id",
    },
  },
  session_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Session,
      key: "id",
    },
  },
  semester_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Semester,
      key: "id",
    },
  },
  section_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Section,
      key: "id",
    },
  },
  status_id: {
    type: DataTypes.INTEGER,
    references: {
      model: StatusTypes,
      key: "id",
    },
  },
}, {
  tableName: "student_list",
  timestamps: false,
});
StudentList.belongsTo(Student, { foreignKey: "student_id", as: "student" });
StudentList.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
StudentList.belongsTo(Program, { foreignKey: "program_id", as: "program" });
StudentList.belongsTo(Session, { foreignKey: "session_id", as: "session" });
StudentList.belongsTo(Semester, { foreignKey: "semester_id", as: "semester" });
StudentList.belongsTo(Section, { foreignKey: "section_id", as: "section" });
StudentList.belongsTo(StatusTypes, { foreignKey: "status_id", as: "status" });
module.exports = StudentList;