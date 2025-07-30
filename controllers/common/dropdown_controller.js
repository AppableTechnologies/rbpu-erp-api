const { pgPool } = require("../../pg_constant");

const getDynamicDropdown = async (req, res, table) => {
  try {
    const query = `SELECT id, title FROM ${table} ORDER BY id ASC;`;
    const result = await pgPool.query(query);
    return res.status(200).json({ [table]: result.rows });
  } catch (error) {
    console.error("Error fetching status types:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching status types" });
  }
};

const getBatchesDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "batches");
};

const getProgramsDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "programs");
};
const getSessionDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "sessions");
};
const getSemesterDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "semesters");
};
const getSectionDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "sections");
};
<<<<<<< HEAD
const getFacultyDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "faculties");
=======
const getStatusTypesDropdown = async (req, res) => {
  getDynamicDropdown(req, res, "status_types");
>>>>>>> f4453f6ef78a351547cd38031abfd6978f5e5141
};

module.exports = {
  getBatchesDropdown,
  getProgramsDropdown,
  getSessionDropdown,
  getSemesterDropdown,
  getSectionDropdown,
<<<<<<< HEAD
  getFacultyDropdown,
=======
  getStatusTypesDropdown
>>>>>>> f4453f6ef78a351547cd38031abfd6978f5e5141
};
