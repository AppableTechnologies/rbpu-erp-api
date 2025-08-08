const {
  Student,
  Program,
  Faculty,
  Session,
  Semester,
  Section,
} = require("../../models");

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
      student_id
    } = req.query;

    const where = {};

    if (faculty_id) where.faculty = faculty_id;
    if (program_id) where.program = program_id;
    if (session_id) where.session = session_id;
    if (semester_id) where.semester = semester_id;
    if (section_id) where.section = section_id;
    if (status_id) where.status = status_id;
    if (student_id) where.student_id = { [Op.iLike]: `%${student_id}%` };

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
          as: 'program',
          attributes: ['title'],
          include: faculty_id ? [{
            model: Faculty,
            as: 'faculty',
            attributes: ['title'],
            where: { id: faculty_id }
          }] : [{
            model: Faculty,
            as: 'faculty',
            attributes: ['title']
          }]
        },
        { model: Session, as: 'session', attributes: ['title'] },
        { model: Semester, as: 'semester', attributes: ['title'] },
        { model: Section, as: 'section', attributes: ['title'] }
      ],
      order: [['student_id', 'DESC']],
    });


    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    // const student = await Student.findByPk(id, {
    //   // include: [
    //   //   { model: Program, as: 'program', attributes: ['title'] },
    //   //   { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
    //   //   { model: Session, as: 'sessionDetail', attributes: ['title'] },
    //   //   { model: Semester, as: 'semesterDetail', attributes: ['title'] },
    //   //   { model: Section, as: 'sectionDetail', attributes: ['title'] }
    //   // ],
    //   include: [
    //     { model: Program, as: 'program', attributes: ['title'] },
    //     // { model: Faculty, as: 'faculty', attributes: ['title'] },
    //     { model: Session, as: 'session', attributes: ['title'] },
    //     { model: Semester, as: 'semester', attributes: ['title'] },
    //     { model: Section, as: 'section', attributes: ['title'] }
    //   ],

    // });
    //

     const student = await Student.findByPk(id, {
      include: [
        {
          model: Program,
          as: 'program',
          attributes: ['title'],
          include: [{
            model: Faculty,
            as: 'faculty',
            attributes: ['title']
          }]
        },
        { model: Session, as: 'session', attributes: ['title'] },
        { model: Semester, as: 'semester', attributes: ['title'] },
        { model: Section, as: 'section', attributes: ['title'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    // res.status(500).json({ message: "Error fetching student" });
  }
};

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
      attributes: ['id', 'title'],
      order: [['id', 'ASC']],
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
      where
    });

    res.status(200).json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ message: "Error fetching programs" });
  }
};



const getSessionsViaProgramId = async (req, res) => {
  const { program_id } = req.query;

  try {
    if (!program_id) {
      return res.status(400).json({ message: "Missing program_id in query." });
    }

    const program = await Program.findByPk(program_id, {
      include: [
        {
          model: Session,
          attributes: ['id', 'title'],
          through: { attributes: [] }, // skip join table details
        },
      ],
      order: [[Session, 'id', 'ASC']],
    });
    

    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    res.status(200).json(program.Sessions);
  } catch (error) {
    console.error("Error fetching sessions by program:", error);
    res.status(500).json({ message: "Error fetching sessions." });
  }
};




// ==================== Export All ====================
module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty,
  getProgramsViaFacultyId,
  getSessionsViaProgramId
};
