const express = require('express');
const userRouter = express.Router();
const { userLogin } = require('../controllers/user_controller')

// userRouter.route("/login").post(userLogin);

userRouter.get("/login", userLogin);
module.exports = userRouter;