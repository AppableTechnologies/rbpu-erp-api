const { StudentList, Student, Faculty, Program, Session, Semester, Section, StatusTypes } = require("../../../models");
const { pgPool } = require("../../../pg_constant");
const { Op } = require("sequelize");

module.exports = {
  getAllIdCards: async (req, res) => {
    try {
      const all = req.query.all === "true";
      const page = parseInt(req.query.page) || 1;
      const limit = all ? null : parseInt(req.query.limit) || 10;
      const offset = (page - 1) * (limit || 0);

      //  base URL for photo paths
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const photoBasePath = `${baseUrl}/public/uploads/student/`;

      if (all) {
        
        const idCards = await StudentList.findAll({
          attributes: [
            'id',
            'student_id',
            'faculty_id',
            'program_id',
            'session_id',
            'semester_id',
            'section_id',
            // 'status_id'
          ],
          include: [
            {
              model: Student,
              as: 'student',
              attributes: [
                ['id', 'student_id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
                ['photo', 'student_photo'],
               
              ],
              required: false
            },
            {
              model: Faculty,
              as: 'faculty',
              attributes: [
                ['id', 'faculty_id'],
                ['title', 'faculty_title']
              ],
              required: false
            },
            {
              model: Program,
              as: 'program',
              attributes: [
                ['id', 'program_id'],
                ['title', 'program_title'],
               
              ],
              required: false
            },
            {
              model: Session,
              as: 'session',
              attributes: [
                ['id', 'session_id'],
                ['title', 'session_title']
              ],
              required: false
            },
            {
              model: Semester,
              as: 'semester',
              attributes: [
                ['id', 'semester_id'],
                ['title', 'semester_title']
              ],
              required: false
            },
            {
              model: Section,
              as: 'section',
              attributes: [
                ['id', 'section_id'],
                ['title', 'section_title']
              ],
              required: false
            },
            // {
            //   model: StatusTypes,
            //   as: 'status',
            //   attributes: [
            //     ['id', 'status_id'],
            //     ['title', 'status_title']
            //   ],
            //   required: false
            // }
          ],
          order: [['id', 'ASC']],
          subQuery: false
        });

       
        const formattedIdCards = idCards.map(card => {
          const cardJson = card.toJSON();
          
          // Construct full photo path if photo exists
          let photoPath = null;
          if (cardJson.student && cardJson.student.student_photo) {
            photoPath = `${photoBasePath}${cardJson.student.student_photo}`;
          }

          return {
            id_card_id: cardJson.id,
            student: cardJson.student ? {
              student_id: cardJson.student.student_id,
              student_name: `${cardJson.student.first_name} ${cardJson.student.last_name}`,
              
              photo: cardJson.student.student_photo, 
              photo_url: photoPath 
            } : null,
            faculty: cardJson.faculty ? {
              faculty_id: cardJson.faculty.faculty_id,
              faculty_title: cardJson.faculty.faculty_title
            } : null,
            program: cardJson.program ? {
              program_id: cardJson.program.program_id,
              program_title: cardJson.program.program_title,
              program_code: cardJson.program.program_code
            } : null,
            session: cardJson.session ? {
              session_id: cardJson.session.session_id,
              session_title: cardJson.session.session_title
            } : null,
            semester: cardJson.semester ? {
              semester_id: cardJson.semester.semester_id,
              semester_title: cardJson.semester.semester_title
            } : null,
            section: cardJson.section ? {
              section_id: cardJson.section.section_id,
              section_title: cardJson.section.section_title
            } : null,
            // status: cardJson.status ? {
            //   status_id: cardJson.status.status_id,
            //   status_title: cardJson.status.status_title
            // } : null
          };
        });

        return res.status(200).json({ data: formattedIdCards });
      } else {
        // For paginated ID cards
        const { count, rows: idCards } = await StudentList.findAndCountAll({
          attributes: ['id'],
          order: [['id', 'ASC']],
          limit,
          offset,
          distinct: true
        });

        if (idCards.length === 0) {
          return res.status(200).json({
            data: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: page,
              limit
            }
          });
        }

        const idCardIds = idCards.map(card => card.id);

        const idCardDetails = await StudentList.findAll({
          attributes: [
            'id',
            'student_id',
            'faculty_id',
            'program_id',
            'session_id',
            'semester_id',
            'section_id',
            // 'status_id'
          ],
          include: [
            {
              model: Student,
              as: 'student',
              attributes: [
                ['id', 'student_id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
                ['photo', 'student_photo'],
               
              ],
              required: false
            },
            {
              model: Faculty,
              as: 'faculty',
              attributes: [
                ['id', 'faculty_id'],
                ['title', 'faculty_title']
              ],
              required: false
            },
            {
              model: Program,
              as: 'program',
              attributes: [
                ['id', 'program_id'],
                ['title', 'program_title'],
               
              ],
              required: false
            },
            {
              model: Session,
              as: 'session',
              attributes: [
                ['id', 'session_id'],
                ['title', 'session_title']
              ],
              required: false
            },
            {
              model: Semester,
              as: 'semester',
              attributes: [
                ['id', 'semester_id'],
                ['title', 'semester_title']
              ],
              required: false
            },
            {
              model: Section,
              as: 'section',
              attributes: [
                ['id', 'section_id'],
                ['title', 'section_title']
              ],
              required: false
            },
            // {
            //   model: StatusTypes,
            //   as: 'status',
            //   attributes: [
            //     ['id', 'status_id'],
            //     ['title', 'status_title']
            //   ],
            //   required: false
            // }
          ],
          where: {
            id: idCardIds
          },
          order: [['id', 'ASC']],
          subQuery: false
        });

       
        const formattedIdCards = idCardDetails.map(card => {
          const cardJson = card.toJSON();
          
          // Construct full photo path if photo exists
          let photoPath = null;
          if (cardJson.student && cardJson.student.student_photo) {
            photoPath = `${photoBasePath}${cardJson.student.student_photo}`;
          }

          return {
            id_card_id: cardJson.id,
            student: cardJson.student ? {
              student_id: cardJson.student.student_id,
              student_name: `${cardJson.student.first_name} ${cardJson.student.last_name}`,
          
              photo: cardJson.student.student_photo, 
              photo_url: photoPath 
            } : null,
            faculty: cardJson.faculty ? {
              faculty_id: cardJson.faculty.faculty_id,
              faculty_title: cardJson.faculty.faculty_title
            } : null,
            program: cardJson.program ? {
              program_id: cardJson.program.program_id,
              program_title: cardJson.program.program_title,
              program_code: cardJson.program.program_code
            } : null,
            session: cardJson.session ? {
              session_id: cardJson.session.session_id,
              session_title: cardJson.session.session_title
            } : null,
            semester: cardJson.semester ? {
              semester_id: cardJson.semester.semester_id,
              semester_title: cardJson.semester.semester_title
            } : null,
            section: cardJson.section ? {
              section_id: cardJson.section.section_id,
              section_title: cardJson.section.section_title
            } : null,
            // status: cardJson.status ? {
            //   status_id: cardJson.status.status_id,
            //   status_title: cardJson.status.status_title
            // } : null
          };
        });

        const totalItems = count;
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
          data: formattedIdCards,
          pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching ID Cards:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  filterIdCards: async (req, res) => {
    try {
      const {
        faculty_id,
        program_id,
        session_id,
        semester_id,
        section_id,
        student_id,
        all = "false",
        page = 1,
        limit = 10
      } = req.query;

      const showAll = all === "true";
      const pageNum = parseInt(page);
      const limitNum = showAll ? null : parseInt(limit);
      const offset = (pageNum - 1) * (limitNum || 0);

      // Build where conditions
      const whereConditions = {};
      
      if (faculty_id) whereConditions.faculty_id = faculty_id;
      if (program_id) whereConditions.program_id = program_id;
      if (session_id) whereConditions.session_id = session_id;
      if (semester_id) whereConditions.semester_id = semester_id;
      if (section_id) whereConditions.section_id = section_id;
      if (student_id) whereConditions.student_id = student_id;

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const photoBasePath = `${baseUrl}/public/uploads/student/`;

      if (showAll) {
        const idCards = await StudentList.findAll({
          attributes: [
            'id',
            'student_id',
            'faculty_id',
            'program_id',
            'session_id',
            'semester_id',
            'section_id',
          ],
          include: [
            {
              model: Student,
              as: 'student',
              attributes: [
                ['id', 'student_id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
                ['photo', 'student_photo'],
               
              ],
              required: false
            },
            {
              model: Faculty,
              as: 'faculty',
              attributes: [
                ['id', 'faculty_id'],
                ['title', 'faculty_title']
              ],
              required: false
            },
            {
              model: Program,
              as: 'program',
              attributes: [
                ['id', 'program_id'],
                ['title', 'program_title'],
              ],
              required: false
            },
            {
              model: Session,
              as: 'session',
              attributes: [
                ['id', 'session_id'],
                ['title', 'session_title']
              ],
              required: false
            },
            {
              model: Semester,
              as: 'semester',
              attributes: [
                ['id', 'semester_id'],
                ['title', 'semester_title']
              ],
              required: false
            },
            {
              model: Section,
              as: 'section',
              attributes: [
                ['id', 'section_id'],
                ['title', 'section_title']
              ],
              required: false
            }
          ],
          where: whereConditions,
          order: [['id', 'ASC']],
          subQuery: false
        });

       
        const formattedIdCards = idCards.map(card => {
          const cardJson = card.toJSON();
          
          // Construct full photo path if photo exists
          let photoPath = null;
          if (cardJson.student && cardJson.student.student_photo) {
            photoPath = `${photoBasePath}${cardJson.student.student_photo}`;
          }

          return {
            id_card_id: cardJson.id,
            student: cardJson.student ? {
              student_id: cardJson.student.student_id,
              student_name: `${cardJson.student.first_name} ${cardJson.student.last_name}`,
             photo: cardJson.student.student_photo,
              photo_url: photoPath
            } : null,
            faculty: cardJson.faculty ? {
              faculty_id: cardJson.faculty.faculty_id,
              faculty_title: cardJson.faculty.faculty_title
            } : null,
            program: cardJson.program ? {
              program_id: cardJson.program.program_id,
              program_title: cardJson.program.program_title,
              program_code: cardJson.program.program_code
            } : null,
            session: cardJson.session ? {
              session_id: cardJson.session.session_id,
              session_title: cardJson.session.session_title
            } : null,
            semester: cardJson.semester ? {
              semester_id: cardJson.semester.semester_id,
              semester_title: cardJson.semester.semester_title
            } : null,
            section: cardJson.section ? {
              section_id: cardJson.section.section_id,
              section_title: cardJson.section.section_title
            } : null
          };
        });

        return res.status(200).json({ 
          data: formattedIdCards,
          filters: {
            faculty_id: faculty_id || 'all',
            program_id: program_id || 'all',
            session_id: session_id || 'all',
            semester_id: semester_id || 'all',
            section_id: section_id || 'all',
            student_id: student_id || 'all'
          }
        });
      } else {
        // For paginated filtered ID cards
        const { count, rows: idCards } = await StudentList.findAndCountAll({
          attributes: ['id'],
          where: whereConditions,
          order: [['id', 'ASC']],
          limit: limitNum,
          offset: offset,
          distinct: true
        });

        if (idCards.length === 0) {
          return res.status(200).json({
            data: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: pageNum,
              limit: limitNum
            },
            filters: {
              faculty_id: faculty_id || 'all',
              program_id: program_id || 'all',
              session_id: session_id || 'all',
              semester_id: semester_id || 'all',
              section_id: section_id || 'all',
              student_id: student_id || 'all'
            }
          });
        }

        const idCardIds = idCards.map(card => card.id);

        const idCardDetails = await StudentList.findAll({
          attributes: [
            'id',
            'student_id',
            'faculty_id',
            'program_id',
            'session_id',
            'semester_id',
            'section_id',
          ],
          include: [
            {
              model: Student,
              as: 'student',
              attributes: [
                ['id', 'student_id'],
                ['first_name', 'first_name'],
                ['last_name', 'last_name'],
                ['photo', 'student_photo'],
                ],
              required: false
            },
            {
              model: Faculty,
              as: 'faculty',
              attributes: [
                ['id', 'faculty_id'],
                ['title', 'faculty_title']
              ],
              required: false
            },
            {
              model: Program,
              as: 'program',
              attributes: [
                ['id', 'program_id'],
                ['title', 'program_title'],
                
              ],
              required: false
            },
            {
              model: Session,
              as: 'session',
              attributes: [
                ['id', 'session_id'],
                ['title', 'session_title']
              ],
              required: false
            },
            {
              model: Semester,
              as: 'semester',
              attributes: [
                ['id', 'semester_id'],
                ['title', 'semester_title']
              ],
              required: false
            },
            {
              model: Section,
              as: 'section',
              attributes: [
                ['id', 'section_id'],
                ['title', 'section_title']
              ],
              required: false
            }
          ],
          where: {
            id: idCardIds,
            ...whereConditions
          },
          order: [['id', 'ASC']],
          subQuery: false
        });

       
        const formattedIdCards = idCardDetails.map(card => {
          const cardJson = card.toJSON();
          
          let photoPath = null;
          if (cardJson.student && cardJson.student.student_photo) {
            photoPath = `${photoBasePath}${cardJson.student.student_photo}`;
          }

          return {
            id_card_id: cardJson.id,
            student: cardJson.student ? {
              student_id: cardJson.student.student_id,
              student_name: `${cardJson.student.first_name} ${cardJson.student.last_name}`,
              photo: cardJson.student.student_photo,
              photo_url: photoPath
            } : null,
            faculty: cardJson.faculty ? {
              faculty_id: cardJson.faculty.faculty_id,
              faculty_title: cardJson.faculty.faculty_title
            } : null,
            program: cardJson.program ? {
              program_id: cardJson.program.program_id,
              program_title: cardJson.program.program_title,
              program_code: cardJson.program.program_code
            } : null,
            session: cardJson.session ? {
              session_id: cardJson.session.session_id,
              session_title: cardJson.session.session_title
            } : null,
            semester: cardJson.semester ? {
              semester_id: cardJson.semester.semester_id,
              semester_title: cardJson.semester.semester_title
            } : null,
            section: cardJson.section ? {
              section_id: cardJson.section.section_id,
              section_title: cardJson.section.section_title
            } : null
          };
        });

        const totalItems = count;
        const totalPages = Math.ceil(totalItems / limitNum);

        return res.status(200).json({
          data: formattedIdCards,
          pagination: {
            totalItems,
            totalPages,
            currentPage: pageNum,
            limit: limitNum,
          },
          filters: {
            faculty_id: faculty_id || 'all',
            program_id: program_id || 'all',
            session_id: session_id || 'all',
            semester_id: semester_id || 'all',
            section_id: section_id || 'all',
            student_id: student_id || 'all'
          }
        });
      }
    } catch (error) {
      console.error("Error filtering ID Cards:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

};