// const express = require("express");
// const router = express.Router()

// const {getPrograms,createPrograms,updatePrograms,deleteProgram} = require('../../controllers/academic/programs_controller')

// router.get("/",getPrograms);
// router.post("/",createPrograms);
// router.put("/:id",updatePrograms);
// router.delete("/:id",deleteProgram);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { createPrograms, updatePrograms, deleteProgram } = require("../../controllers/academic/programs_controller");
const Program = require("../../models/academic/Program");  // <-- add this import

// 👇 Replace getPrograms with inline controller to allow filtering by faculty_id
router.get('/', async (req, res) => {
  const { faculty_id } = req.query;
  try {
    const where = faculty_id ? { faculty_id } : {};
    const programs = await Program.findAll({ where });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// Keep other routes
router.post("/", createPrograms);
router.put("/:id", updatePrograms);
router.delete("/:id", deleteProgram);

module.exports = router;
