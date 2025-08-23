// const { pgPool } = require("../../pg_constant");

// // const getStudents = async (req, res) => {
// //   try {
// //     const result = await pgPool.query("SELECT * FROM students ORDER BY student_id DESC");
// //     res.status(200).json(result.rows);
// //   } catch (error) {
// //     console.error("Error fetching students:", error);
// //     res.status(500).json({ message: "Error fetching students" });
// //   }
// // };
// const getStudents = async (req, res) => {
//   try {
//     const query = `
//       SELECT
//         s.student_id,
//         s.first_name,
//         s.status,
//         p.title AS program,

//         json_agg(
//           json_build_object(
//             'semester', sem.title,
//             'section', sec.title,
//             'session', sess.title
//           )
//         ) AS academic_details

//       FROM students s
//       LEFT JOIN programs p ON s.program_id = p.id
//       LEFT JOIN program_semester_sections pss ON s.program_id = pss.program_id
//       LEFT JOIN semesters sem ON pss.semester_id = sem.id
//       LEFT JOIN sections sec ON pss.section_id = sec.id
//       LEFT JOIN program_session ps ON s.program_id = ps.program_id
//       LEFT JOIN sessions sess ON ps.session_id = sess.id

//       GROUP BY s.student_id, s.first_name, s.status, p.title
//       ORDER BY s.student_id DESC
//     `;

//     const result = await pgPool.query(query);
//     res.status(200).json({ students: result.rows });
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ message: "Error fetching students" });
//   }
// };

// const getStudentById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pgPool.query("SELECT * FROM students WHERE student_id = $1", [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error("Error fetching student by ID:", error);
//     res.status(500).json({ message: "Error fetching student" });
//   }
// };
// const getFaculty = async (req, res) => {
//   try {
//     const result = await pgPool.query("SELECT * FROM faculties");
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Error fetching faculties:", error);
//     res.status(500).json({ message: "Error fetching faculties" });
//   }
// };
// const updateStudent = async (req, res) => {
//   const { id } = req.params;
//   const { faculty, program, session, semester, section, status } = req.body;

//   try {
//     await pgPool.query(
//       `UPDATE students
//        SET faculty = $1,
//            program = $2,
//            session = $3,
//            semester = $4,
//            section = $5,
//            status = $6
//        WHERE student_id = $7`,
//       [faculty, program, session, semester, section, status, id]
//     );

//     res.status(200).json({ message: "Student updated successfully" });
//   } catch (error) {
//     console.error("Error updating student:", error);
//     res.status(500).json({ message: "Error updating student" });
//   }
// };

// const deleteStudent = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await pgPool.query("DELETE FROM students WHERE student_id = $1", [id]);
//     res.status(200).json({ message: "Student deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting student:", error);
//     res.status(500).json({ message: "Error deleting student" });
//   }
// };

// module.exports = {
//   getStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent,
//   getFaculty,
// };

const { 
  Student,
  Program,
  Faculty,
  Session,
  Semester,
  Section,
} = require("../../../models");
// const getStudents = async (req, res) => {
//   try {
//     const students = await Student.findAll({
//       include: [
//         { model: Program, as: 'program', attributes: ['title'] },
//         { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
//         { model: Session, as: 'sessionDetail', attributes: ['title'] },
//         { model: Semester, as: 'semesterDetail', attributes: ['title'] },
//         { model: Section, as: 'sectionDetail', attributes: ['title'] }
//       ],
//       order: [['student_id', 'DESC']],
//     });
//     res.status(200).json({ students });
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ message: "Error fetching students" });
//   }
// };
// ==================== Get Student by ID ====================
const { Op } = require("sequelize");
const getStudents = async (req, res) => {
  try {
    const {
      faculty_id,
      program_id,
      session_id,
      semester_id,
      section_id,
      status_id,
      student_id,
    } = req.query;
     if (
      !faculty_id &&
      !program_id &&
      !session_id &&
      !semester_id &&
      !section_id &&
      !status_id &&
      !student_id
    ) {
      return res.status(200).json({ students: [] });
    }

    const where = {};
    if (program_id) where.program_id = program_id;
    if (session_id) where.session_id = session_id;
    if (semester_id) where.semester_id = semester_id;
    if (section_id) where.section_id = section_id;
    if (status_id) where.status = status_id;
    if (student_id) {
      // case-insensitive search for student id
      where.student_id = { [Op.iLike]: `%${student_id}%` };
    }

    //     const students = await Student.findAll({
    //       where,
    //       // include: [
    //       //   { model: Program, as: 'program', attributes: ['title'] },
    //       //   { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
    //       //   { model: Session, as: 'sessionDetail', attributes: ['title'] },
    //       //   { model: Semester, as: 'semesterDetail', attributes: ['title'] },
    //       //   { model: Section, as: 'sectionDetail', attributes: ['title'] }
    //       // ],
    //       include: [
    //   { model: Program, as: 'program', attributes: ['title'] },
    //   // { model: Faculty, as: 'faculty', attributes: ['title'] },
    //   { model: Session, as: 'session', attributes: ['title'] },
    //   { model: Semester, as: 'semester', attributes: ['title'] },
    //   { model: Section, as: 'section', attributes: ['title'] }
    // ],
    //       order: [['student_id', 'DESC']],
    //     });
   const students = await Student.findAll({
      where,
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["title"],
          include: [
            {
              model: Faculty,
              as: "faculty",
              attributes: ["title"],
              ...(faculty_id ? { where: { id: faculty_id } } : {}),
            },
          ],
        },
        { model: Session, as: "session", attributes: ["title"] },
        { model: Semester, as: "semester", attributes: ["title"] },
        { model: Section, as: "section", attributes: ["title"] },
      ],
      order: [["student_id", "DESC"]],
    });

    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};
// const getStudentById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     // const student = await Student.findByPk(id, {
//     //   // include: [
//     //   //   { model: Program, as: 'program', attributes: ['title'] },
//     //   //   { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
//     //   //   { model: Session, as: 'sessionDetail', attributes: ['title'] },
//     //   //   { model: Semester, as: 'semesterDetail', attributes: ['title'] },
//     //   //   { model: Section, as: 'sectionDetail', attributes: ['title'] }
//     //   // ],
//     //   include: [
//     //     { model: Program, as: 'program', attributes: ['title'] },
//     //     // { model: Faculty, as: 'faculty', attributes: ['title'] },
//     //     { model: Session, as: 'session', attributes: ['title'] },
//     //     { model: Semester, as: 'semester', attributes: ['title'] },
//     //     { model: Section, as: 'section', attributes: ['title'] }
//     //   ],
//     // });
//     const student = await Student.findByPk(id, {
//       include: [
//         {
//           model: Program,
//           as: "program",
//           attributes: ["title"],
//           include: [
//             {
//               model: Faculty,
//               as: "faculty",
//               attributes: ["title"],
//             },
//           ],
//         },
//         { model: Session, as: "session", attributes: ["title"] },
//         { model: Semester, as: "semester", attributes: ["title"] },
//         { model: Section, as: "section", attributes: ["title"] },
//       ],
//     });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }
//     res.status(200).json(student);
//   } catch (error) {
//     console.error("Error fetching student by ID:", error);
//     // res.status(500).json({ message: "Error fetching student" });
//   }
// };
// ==================== Update Student ====================
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    faculty_id,
    program_id,
    session_id,
    semester_id,
    section_id,
    status,
  } = req.body;
  try {
    // const [updated] = await Student.update(
    //   {
    //     faculty: faculty_id,
    //     program: program_id,
    //     session: session_id,
    //     semester: semester_id,
    //     section: section_id,
    //     status,
    //   },
    //   { where: { student_id: id } }
    // );
    const [updated] = await Student.update(
      {
        program_id,
        session_id,
        semester_id,
        section_id,
        status,
      },
      { where: { student_id: id } }
    );
    if (updated === 0) {
      return res
        .status(404)
        .json({ message: "Student not found or no changes made" });
    }
    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student" });
  }
};
// ==================== Delete Student ====================
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Student.destroy({ where: { student_id: id } });
    if (deleted === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student" });
  }
};
// ==================== Get All Faculties ====================
const getFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      attributes: ["id", "title"],
      order: [["id", "ASC"]],
    });
    res.status(200).json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ message: "Error fetching faculties" });
  }
};
const getProgramsViaFacultyId = async (req, res) => {
  const { faculty_id } = req.query;
  try {
    const where = faculty_id ? { faculty_id } : {};
    const programs = await Program.findAll({
      where,
    });
    res.status(200).json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Error fetching programs" });
  }
};

// ==================== Export All ====================
module.exports = {
  getStudents,
  // getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty,
  getProgramsViaFacultyId,

};
