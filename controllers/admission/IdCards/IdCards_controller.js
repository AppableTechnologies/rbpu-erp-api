// const { Op } = require("sequelize");
// const { Student, Faculty, Program, Session, Semester, Section, ProgramSession, ProgramSemester, ProgramSemesterSection } = require("../../../models");

// module.exports = {
//   getIdCards: async (req, res) => {
//     try {
//       const {
//         faculty_id,
//         program_id,
//         session_id,
//         semester_id,
//         section_id,
//         status = 'active',
//         search,
//         page = 1,
//         limit = 10
//       } = req.query;

//       const offset = (page - 1) * limit;

//       console.log('Query parameters:', {
//         faculty_id, program_id, session_id, semester_id, section_id, status, search, page, limit
//       });

//       // Debug: Check if we have any students at all
//       const totalStudents = await Student.count();
//       console.log('Total students in database:', totalStudents);

//       const activeStudents = await Student.count({ where: { status } });
//       console.log('Active students:', activeStudents);

//       // Build where clause
//       const where = { status };
//       if (program_id) where.program_id = program_id;

//       if (search) {
//         where[Op.or] = [
//           { student_id: { [Op.iLike]: `%${search}%` } },
//           { first_name: { [Op.iLike]: `%${search}%` } },
//           { last_name: { [Op.iLike]: `%${search}%` } },
//           { email: { [Op.iLike]: `%${search}%` } }
//         ];
//       }

//       console.log('Final where clause:', where);

//       // First, get the total count
//       const count = await Student.count({ where });
//       console.log('Students matching criteria:', count);

//       if (count === 0) {
//         // Let's debug why no students are found
//         const allStudents = await Student.findAll({ limit: 5 });
//         console.log('Sample students:', allStudents.map(s => ({
//           student_id: s.student_id,
//           program_id: s.program_id,
//           status: s.status
//         })));

//         return res.status(200).json({
//           success: true,
//           data: [],
//           pagination: {
//             totalItems: 0,
//             totalPages: 0,
//             currentPage: parseInt(page),
//             limit: parseInt(limit),
//             hasNext: false,
//             hasPrev: false
//           }
//         });
//       }

//       // Fetch students with program data only
//       const students = await Student.findAll({
//         where,
//         attributes: [
//           'student_id',
//           'first_name',
//           'last_name',
//           'photo',
//           'program_id'
//         ],
//         include: [
//           {
//             model: Program,
//             attributes: ['id', 'title', 'faculty_id'],
//             include: [
//               {
//                 model: Faculty,
//                 attributes: ['id', 'title'],
//                 as: 'faculty'
//               }
//             ]
//           }
//         ],
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         order: [
//           ['program_id', 'ASC'],
//           ['student_id', 'ASC']
//         ]
//       });

//       console.log('Found students:', students.length);
//       if (students.length > 0) {
//         console.log('First student:', {
//           student_id: students[0].student_id,
//           program_id: students[0].program_id,
//           hasProgram: !!students[0].Program,
//           programTitle: students[0].Program?.title,
//           hasFaculty: !!students[0].Program?.Faculty,
//           facultyTitle: students[0].Program?.Faculty?.title
//         });
//       }

//       // Get the complete hierarchical data for each student
//       const idCardsData = await Promise.all(students.map(async (student) => {
//         try {
//           console.log(`Processing student ${student.student_id} with program_id ${student.program_id}`);

//           // Get sessions for this program
//           const programSessions = await ProgramSession.findAll({
//             where: { program_id: student.program_id },
//             include: [{ model: Session, attributes: ['id', 'title'] }],
//             order: [['session_id', 'ASC']]
//           });

//           console.log(`Sessions for program ${student.program_id}:`, programSessions.length);

//           // Get semesters for this program
//           const programSemesters = await ProgramSemester.findAll({
//             where: { program_id: student.program_id },
//             include: [{ model: Semester, attributes: ['id', 'title'] }],
//             order: [['semester_id', 'ASC']]
//           });

//           console.log(`Semesters for program ${student.program_id}:`, programSemesters.length);

//           // Get sections for this program
//           const programSections = await ProgramSemesterSection.findAll({
//             where: { program_id: student.program_id },
//             include: [{ model: Section, attributes: ['id', 'title'] }],
//             order: [['section_id', 'ASC']]
//           });

//           console.log(`Sections for program ${student.program_id}:`, programSections.length);

//           // Get the first of each (or use your business logic)
//           const session = programSessions[0]?.Session;
//           const semester = programSemesters[0]?.Semester;
//           const section = programSections[0]?.Section;

//           return {
//             student_id: student.student_id,
//             name: `${student.first_name} ${student.last_name}`.trim(),
//             photo: student.photo,
//             faculty: student.Program?.Faculty ? {
//               id: student.Program.Faculty.id,
//               title: student.Program.Faculty.title
//             } : null,
//             program: student.Program ? {
//               id: student.Program.id,
//               title: student.Program.title
//             } : null,
//             session: session ? {
//               id: session.id,
//               title: session.title
//             } : null,
//             semester: semester ? {
//               id: semester.id,
//               title: semester.title
//             } : null,
//             section: section ? {
//               id: section.id,
//               title: section.title
//             } : null,
//             program_path: [
//               student.Program?.Faculty?.title,
//               student.Program?.title,
//               session?.title,
//               semester?.title,
//               section?.title
//             ].filter(Boolean).join(' > ')
//           };
//         } catch (error) {
//           console.error(`Error processing student ${student.student_id}:`, error);
//           return {
//             student_id: student.student_id,
//             name: `${student.first_name} ${student.last_name}`.trim(),
//             photo: student.photo,
//             faculty: null,
//             program: null,
//             session: null,
//             semester: null,
//             section: null,
//             program_path: 'Unknown program path'
//           };
//         }
//       }));

//       // Apply additional filtering
//       const filteredData = idCardsData.filter(card => {
//         if (faculty_id && card.faculty?.id != faculty_id) return false;
//         if (session_id && card.session?.id != session_id) return false;
//         if (semester_id && card.semester?.id != semester_id) return false;
//         if (section_id && card.section?.id != section_id) return false;
//         return true;
//       });

//       console.log('Final data count:', filteredData.length);

//       return res.status(200).json({
//         success: true,
//         data: filteredData,
//         pagination: {
//           totalItems: count,
//           totalPages: Math.ceil(count / limit),
//           currentPage: parseInt(page),
//           limit: parseInt(limit),
//           hasNext: page < Math.ceil(count / limit),
//           hasPrev: page > 1
//         }
//       });

//     } catch (err) {
//       console.error("Error fetching ID cards data:", err);
//       return res.status(500).json({
//         success: false,
//         error: "Failed to fetch ID cards data",
//         message: err.message
//       });
//     }
//   }
// };



// no based on active 

const { Op } = require("sequelize");
const { Student, Faculty, Program, Session, Semester, Section, ProgramSession, ProgramSemester, ProgramSemesterSection } = require("../../../models");

module.exports = {
  getIdCards: async (req, res) => {
    try {
      const {
        faculty_id,
        program_id,
        session_id,
        semester_id,
        section_id,
        search,
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;

      console.log('Query parameters:', {
        faculty_id, program_id, session_id, semester_id, section_id, search, page, limit
      });

      // Build where clause - NO status filter
      const where = {};
      if (program_id) where.program_id = program_id;

      if (search) {
        where[Op.or] = [
          { student_id: { [Op.iLike]: `%${search}%` } },
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      console.log('Final where clause:', where);

      // First, get the total count
      const count = await Student.count({ where });
      console.log('Students matching criteria:', count);

      if (count === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            hasNext: false,
            hasPrev: false
          }
        });
      }

      // Fetch students with program data only - ADD 'id' field
      const students = await Student.findAll({
        where,
        attributes: [
          'id', // Added primary key
          'student_id',
          'first_name',
          'last_name',
          'photo',
          'program_id'
        ],
        include: [
          {
            model: Program,
            attributes: ['id', 'title', 'faculty_id'],
            include: [
              {
                model: Faculty,
                attributes: ['id', 'title'],
                as: 'faculty'
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['program_id', 'ASC'],
          ['student_id', 'ASC']
        ]
      });

      console.log('Found students:', students.length);

      // Get the complete hierarchical data for each student
      const idCardsData = await Promise.all(students.map(async (student) => {
        try {
          // Get sessions for this program
          const programSessions = await ProgramSession.findAll({
            where: { program_id: student.program_id },
            include: [{ model: Session, attributes: ['id', 'title'] }],
            order: [['session_id', 'ASC']]
          });

          // Get semesters for this program
          const programSemesters = await ProgramSemester.findAll({
            where: { program_id: student.program_id },
            include: [{ model: Semester, attributes: ['id', 'title'] }],
            order: [['semester_id', 'ASC']]
          });

          // Get sections for this program
          const programSections = await ProgramSemesterSection.findAll({
            where: { program_id: student.program_id },
            include: [{ model: Section, attributes: ['id', 'title'] }],
            order: [['section_id', 'ASC']]
          });

          // Get the first of each (or use your business logic)
          const session = programSessions[0]?.Session;
          const semester = programSemesters[0]?.Semester;
          const section = programSections[0]?.Section;

          return {
            id: student.id, // Added primary key
            student_id: student.student_id,
            name: `${student.first_name} ${student.last_name}`.trim(),
            photo: student.photo,
            faculty: student.Program?.Faculty ? {
              id: student.Program.Faculty.id,
              title: student.Program.Faculty.title
            } : null,
            program: student.Program ? {
              id: student.Program.id,
              title: student.Program.title
            } : null,
            session: session ? {
              id: session.id,
              title: session.title
            } : null,
            semester: semester ? {
              id: semester.id,
              title: semester.title
            } : null,
            section: section ? {
              id: section.id,
              title: section.title
            } : null,
            program_path: [
              student.Program?.Faculty?.title,
              student.Program?.title,
              session?.title,
              semester?.title,
              section?.title
            ].filter(Boolean).join(' > ')
          };
        } catch (error) {
          console.error(`Error processing student ${student.student_id}:`, error);
          return {
            id: student.id, // Added primary key
            student_id: student.student_id,
            name: `${student.first_name} ${student.last_name}`.trim(),
            photo: student.photo,
            faculty: null,
            program: null,
            session: null,
            semester: null,
            section: null,
            program_path: 'Unknown program path'
          };
        }
      }));

      // Apply additional filtering
      const filteredData = idCardsData.filter(card => {
        if (faculty_id && card.faculty?.id != faculty_id) return false;
        if (session_id && card.session?.id != session_id) return false;
        if (semester_id && card.semester?.id != semester_id) return false;
        if (section_id && card.section?.id != section_id) return false;
        return true;
      });

      console.log('Final data count:', filteredData.length);

      return res.status(200).json({
        success: true,
        data: filteredData,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      });

    } catch (err) {
      console.error("Error fetching ID cards data:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch ID cards data",
        message: err.message
      });
    }
  }
};