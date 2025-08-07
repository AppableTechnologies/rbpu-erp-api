const {
  Student,
  Program,
  Faculty,
  Session,
  Semester,
  Section,
} = require("../../models");

// ==================== Get All Students ====================
const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: Program, as: 'program', attributes: ['title'] },
        { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
        { model: Session, as: 'sessionDetail', attributes: ['title'] },
        { model: Semester, as: 'semesterDetail', attributes: ['title'] },
        { model: Section, as: 'sectionDetail', attributes: ['title'] }
      ],
      order: [['student_id', 'DESC']],
    });

    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// ==================== Get Student by ID ====================
const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findByPk(id, {
      include: [
        { model: Program, as: 'program', attributes: ['title'] },
        { model: Faculty, as: 'facultyDetail', attributes: ['title'] },
        { model: Session, as: 'sessionDetail', attributes: ['title'] },
        { model: Semester, as: 'semesterDetail', attributes: ['title'] },
        { model: Section, as: 'sectionDetail', attributes: ['title'] }
      ],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ message: "Error fetching student" });
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
    const [updated] = await Student.update(
      {
        faculty: faculty_id,
        program: program_id,
        session: session_id,
        semester: semester_id,
        section: section_id,
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

// ==================== Export All ====================
module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty,
};
