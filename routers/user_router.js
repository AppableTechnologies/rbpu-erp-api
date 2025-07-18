const express = require('express');
const userRouter = express.Router();
const { userLogin } = require('../controllers/user_controller')

userRouter.route("/login").post(userLogin);
module.exports = userRouter;