const { pgPool } = require("../../pg_constant");
const {
  Batch,
  Program,
  Session,
  Semester,
  Faculty,
  StatusTypes,
} = require("../../models");

const modelMap = {
  batches: Batch,
  programs: Program,
  sessions: Session,
  semesters: Semester,
  // sections: Section,
  faculties: Faculty,
  status_types: StatusTypes,
};

// const getDynamicDropdown = async (req, res, table) => {
//   try {
//     const query = `SELECT id, title FROM ${table} ORDER BY id ASC;`;
//     const result = await pgPool.query(query);
//     return res.status(200).json({ [table]: result.rows });
//   } catch (error) {
//     console.error("Error fetching status types:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error while fetching status types" });
//   }
// };

const getDynamicDropdown = async (req, res, modelKey) => {
  try {
    const model = modelMap[modelKey];
    if (!model) {
      return res.status(404).json({ message: "Table or model not found" });
    }
    const items = await model.findAll({ attributes: ["id", "title"], order: [["id", "ASC"]], });

    return res.status(200).json({[modelKey]: items});
  } catch (error) {
    console.error("Error fetching dropdown:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching dropdown" });
  }
};

const getBatchesDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "batches");

const getProgramsDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "programs");

const getSessionDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "sessions");

const getSemesterDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "semesters");

const getSectionDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "sections");

const getFacultyDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "faculties");

const getStatusTypesDropdown = async (req, res) =>
  getDynamicDropdown(req, res, "status_types");

module.exports = {
  getBatchesDropdown,
  getProgramsDropdown,
  getSessionDropdown,
  getSemesterDropdown,
  getSectionDropdown,
  getFacultyDropdown,
  getStatusTypesDropdown,
};
