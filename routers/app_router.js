const express = require("express");
const router = express.Router();
const careerCandidateRouter = require("./user_router");

router.use("/api/users", careerCandidateRouter);
router.get("/api/test", (req, res) => res.send("✅ Working"));


module.exports = router;
