const { pgPool } = require("../../pg_constant");

// const getStudents = async (req, res) => {
//   try {
//     const result = await pgPool.query("SELECT * FROM students ORDER BY student_id DESC");
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ message: "Error fetching students" });
//   }
// };
const getStudents = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.student_id,
        s.first_name,
        s.status,
        p.title AS program,

        json_agg(
          json_build_object(
            'semester', sem.title,
            'section', sec.title,
            'session', sess.title
          )
        ) AS academic_details

      FROM students s
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN program_semester_sections pss ON s.program_id = pss.program_id
      LEFT JOIN semesters sem ON pss.semester_id = sem.id
      LEFT JOIN sections sec ON pss.section_id = sec.id
      LEFT JOIN program_session ps ON s.program_id = ps.program_id
      LEFT JOIN sessions sess ON ps.session_id = sess.id

      GROUP BY s.student_id, s.first_name, s.status, p.title
      ORDER BY s.student_id DESC
    `;

    const result = await pgPool.query(query);
    res.status(200).json({ students: result.rows });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};




const getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pgPool.query("SELECT * FROM students WHERE student_id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ message: "Error fetching student" });
  }
};
const getFaculty = async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM faculties");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    res.status(500).json({ message: "Error fetching faculties" });
  }
};
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { faculty, program, session, semester, section, status } = req.body;

  try {
    await pgPool.query(
      `UPDATE students
       SET faculty = $1,
           program = $2,
           session = $3,
           semester = $4,
           section = $5,
           status = $6
       WHERE student_id = $7`,
      [faculty, program, session, semester, section, status, id]
    );

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student" });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    await pgPool.query("DELETE FROM students WHERE student_id = $1", [id]);
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student" });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getFaculty,
};
