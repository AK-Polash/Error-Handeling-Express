const express = require("express");
const _ = express.Router();
const {
  signUpController,
  userVerificationController,
  forgotPasswordController,
  matchOtpController,
  resetPasswordController,
  loginController,
} = require("../../controllers/authControllers");

_.post("/signup", signUpController);
_.post("/verification", userVerificationController);
_.post("/forgotpassword", forgotPasswordController);
_.post("/matchotp", matchOtpController);
_.post("/resetpassword", resetPasswordController);
_.post("/login", loginController);

module.exports = _;
