const Classroom = require("./academic/Classroom.js");
const Faculty = require("./academic/Faculty.js");
const Program = require("./academic/Program.js");
const ProgramSession = require("./academic/ProgramSession.js");
const Batch = require("./academic/batch/Batch.js");
const BatchProgram = require("./academic/batch/BatchProgram.js");
const Session = require("./academic/Session.js");
const Menu = require("./common/Menus.js");
const Submenu = require("./common/SubMenus.js");
const Semester = require("./academic/semester/Semester.js");
const ProgramSemester = require("./academic/semester/programSemester.js");
const StatusTypes = require("./admission/StatusTypes.js");
const Section = require("./academic/Section.js");
const ProgramSemesterSection = require("./academic/semester/ProgramSemesterSection.js");
const ProgramSubject = require("./academic/subject/programSubject.js");
const Subject = require("./academic/subject/subjects.js");
const EnrollSubject = require("./academic/enroll_subject/EnrollSubject.js");
const EnrollSubjectSubject = require("./academic/enroll_subject/EnrollSubjectSubject.js");
const Student = require("./admission/Students.js");
const StudentList = require("./admission/StudentList.js");
const FeesDiscounts = require("./fees/feesDiscount/FeesDiscounts.js");
const FeesDiscountsStatusTypes = require("./fees/feesDiscount/feesDiscountStatusTypes.js");
const FeesTypes = require("./fees/FeesTypes.js");
const FeesCategoryFeesDiscount = require("./fees/feesDiscount/FeesCategoryFeesDiscount.js");
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

Semester.belongsToMany(Program, {
  through: ProgramSemester,
  foreignKey: "semester_id",
  otherKey: "program_id",
});

Program.belongsToMany(Semester, {
  through: ProgramSemester,
  foreignKey: "program_id",
  otherKey: "semester_id",
});

// Remove all existing associations and use just these:

Subject.belongsToMany(Program, {
  through: ProgramSubject, // Use the exact model name
  foreignKey: "subject_id",
});

Program.belongsToMany(Subject, {
  through: ProgramSubject, // Use the exact model name
  foreignKey: "program_id",
});

ProgramSubject.belongsTo(Program, { foreignKey: "program_id" });
ProgramSubject.belongsTo(Subject, { foreignKey: "subject_id" });

Program.hasMany(ProgramSubject, { foreignKey: "program_id" });
Subject.hasMany(ProgramSubject, { foreignKey: "subject_id" });



// Many-to-many between Semester and Section via ProgramSemesterSection
Semester.belongsToMany(Section, {
  through: ProgramSemesterSection,
  foreignKey: "semester_id",
  otherKey: "section_id",
});

Section.belongsToMany(Semester, {
  through: ProgramSemesterSection,
  foreignKey: "section_id",
  otherKey: "semester_id",
});

Semester.hasMany(ProgramSemester, { foreignKey: "semester_id" });
ProgramSemester.belongsTo(Semester, { foreignKey: "semester_id" });
Program.hasMany(ProgramSemester, { foreignKey: "program_id" });
ProgramSemester.belongsTo(Program, { foreignKey: "program_id" });

// Optional: If you need direct access to the join table
Batch.hasMany(BatchProgram, { foreignKey: "batch_id" });
Program.hasMany(BatchProgram, { foreignKey: "program_id" });
BatchProgram.belongsTo(Batch, { foreignKey: "batch_id" });
BatchProgram.belongsTo(Program, { foreignKey: "program_id" });

// Optional reverse relations (useful for includes)
// Session.hasMany(ProgramSession, { foreignKey: "session_id" });
// Program.hasMany(ProgramSession, { foreignKey: "program_id" });

ProgramSession.belongsTo(Session, { foreignKey: "session_id" });
ProgramSession.belongsTo(Program, { foreignKey: "program_id" });

Program.belongsTo(Faculty, { foreignKey: "faculty_id", as: "faculty" });
Faculty.hasMany(Program, { foreignKey: "faculty_id", as: "programs" });
// Faculty.hasMany(Program, { foreignKey: "faculty_id", as: "programs" });

ProgramSemesterSection.belongsTo(Program, { foreignKey: "program_id" });
ProgramSemesterSection.belongsTo(Semester, { foreignKey: "semester_id" });
ProgramSemesterSection.belongsTo(Section, { foreignKey: "section_id" });

// Program.hasMany(ProgramSemesterSection, { foreignKey: "program_id" });
// Semester.hasMany(ProgramSemesterSection, { foreignKey: "semester_id" });
Section.hasMany(ProgramSemesterSection, { foreignKey: "section_id" });

// EnrollSubject relations

Section.hasMany(EnrollSubject, { foreignKey: "section_id" });
// Subject.hasMany(EnrollSubject, { foreignKey: "subject_id" });

EnrollSubject.belongsTo(Program, { foreignKey: "program_id", as: "program" });
Program.hasMany(EnrollSubject, {
  foreignKey: "program_id",
  as: "enrollSubjects",
});

EnrollSubject.belongsTo(Semester, {
  foreignKey: "semester_id",
  as: "semester",
});
Semester.hasMany(EnrollSubject, { foreignKey: "semester_id" });


EnrollSubject.belongsTo(Section, { foreignKey: "section_id", as: "section" });
// EnrollSubject.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

// EnrollSubjectSubject.belongsTo(Subject, { foreignKey: "subject_id" });
// Subject.hasMany(EnrollSubjectSubject, { foreignKey: "enroll_subject_id" });

EnrollSubject.belongsToMany(Subject, {
  through: EnrollSubjectSubject,
  foreignKey: "enroll_subject_id",
  otherKey:"subject_id"
});
Subject.belongsToMany(EnrollSubject, {
  through: EnrollSubjectSubject,
  foreignKey: "subject_id",
  otherKey:"enroll_subject_id"
});

// Optional: direct belongsTo if you want easy access to the subject from the join
EnrollSubjectSubject.belongsTo(Subject, { foreignKey: "subject_id" });
EnrollSubjectSubject.belongsTo(EnrollSubject, { foreignKey: "enroll_subject_id" });
EnrollSubjectSubject.belongsTo(EnrollSubject, { foreignKey: "enroll_subject_id" });

FeesDiscounts.belongsToMany(StatusTypes, {
  through: FeesDiscountsStatusTypes,
  foreignKey: "fees_discount_id",
  otherKey: "status_type_id",
  as: "typeDetails"
});

StatusTypes.belongsToMany(FeesDiscounts, {
  through: FeesDiscountsStatusTypes,
  foreignKey: "status_type_id",
  otherKey: "fees_discount_id"
});

FeesDiscounts.belongsToMany(FeesTypes, {
  through: FeesCategoryFeesDiscount,
  foreignKey: "fees_discount_id",
  otherKey: "fees_category_id",
  as: "feesTypes"
});

FeesTypes.belongsToMany(FeesDiscounts, {
  through: FeesCategoryFeesDiscount,
  foreignKey: "fees_category_id",
  otherKey: "fees_discount_id"
});

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
  Semester,
  ProgramSemester,
  StatusTypes,
  Section,
  ProgramSemesterSection,
  Subject,
  ProgramSubject,
  EnrollSubject,
  EnrollSubjectSubject,
  Student,        
  StudentList,
  FeesDiscounts,
  FeesDiscountsStatusTypes,
  FeesTypes,
  FeesCategoryFeesDiscount
};