const { Op } = require("sequelize");
const { Subject, EnrollSubject, Program, Semester, Section } = require("../../models");

module.exports.getEnrollSubjects = async (req, res) => {
  // const all = req.query.all === "true";
  // const page = parseInt(req.query.page, 10) || 1;
  // const limit = all ? undefined : parseInt(req.query.limit, 10) || 10;
  // const offset = all ? undefined : (page - 1) * limit;

  // try {
  //   const { count, rows } = await EnrollSubject.findAndCountAll({
  //     attributes: ["id", "program_id", "semester_id", "section_id", "status"],
  //     include: [
  //       { model: Program, as: "program", attributes: ["id", "title", "slug"] },
  //       { model: Semester, as: "semester", attributes: ["id", "title", "year"] },
  //       { model: Section, as: "section", attributes: ["id", "title", "seat"] },
  //       // { model: Subject, as: "subject", attributes: ["id", "title", "code"] }, // ✅ fixed
  //     ],
  //     limit,
  //     offset,
  //     distinct: true,
  //     order: [["id", "ASC"]],
  //   });

  //   res.json({
  //     data: rows,
  //     pagination: {
  //       totalItems: count,
  //       totalPages: limit ? Math.ceil(count / limit) : 1,
  //       currentPage: page,
  //       limit: limit || "all",
  //     },
  //   });
  // } catch (error) {
  //   console.error("Error fetching enroll subjects:", error);
  //   res.status(500).json({ error: "Server error while fetching enroll subjects" });
  // }
};

module.exports.createEnrollCourse = (req,res) =>{
  
}


 
