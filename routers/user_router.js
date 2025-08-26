const express = require('express');
const userRouter = express.Router();
const { userLogin } = require('../controllers/user_controller')

// // userRouter.route("/login").post(userLogin);

userRouter.post("/login", userLogin);
module.exports = userRouter;