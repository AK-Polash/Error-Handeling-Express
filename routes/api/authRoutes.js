const express = require("express");
const _ = express.Router();
const {
  signUpController,
  userVerificationController,
  forgotPasswordController,
  loginController,
} = require("../../controllers/authControllers");

_.post("/signup", signUpController);
_.post("/verification", userVerificationController);
_.post("/forgotpassword", forgotPasswordController);
_.post("/login", loginController);

module.exports = _;
