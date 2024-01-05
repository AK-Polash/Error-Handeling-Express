require("dotenv").config();
const {
  nameValidator,
  emailValidator,
  passwordValidator,
} = require("../utils/validators");
const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const tokenCreator = require("../utils/tokenCreator");
const mailSender = require("../utils/mailSender");
const verificationTemplate = require("../emailTemplates/verificationTemplate");

const signUpController = (req, res) => {
  const { userName, email, password } = req.body;

  if (nameValidator(res, userName, "userName")) {
    return;
  } else if (emailValidator(res, email, "email")) {
    return;
  } else if (passwordValidator(res, password, "password")) {
    return;
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) return res.status(500).send({ error: "Hashing Error Occured" });

    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .send({ error: "User Already Exist", errorField: "email" });
      }

      const newUser = new UserModel({
        userName,
        email,
        password: hash,
      });

      const token = tokenCreator(
        { email: newUser.email },
        process.env.JWT_TOKEN,
        "1d"
      );

      mailSender(
        newUser.email,
        "Account Verification",
        verificationTemplate(token)
      );

      await newUser.save().then(() => {
        return res.status(201).send({ success: "Registration Successful" });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
};

const userVerificationController = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).send({ error: "Cridential Error Occured" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN);
    const { email } = decodedToken;
    const existingUser = UserModel.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    if (!existingUser) {
      return res
        .status(404)
        .send({ error: "Occured An Error While Verifying The User" });
    }
    return res.status(200).send({ success: "Account verified successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  if (emailValidator(res, email, "email")) return;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .send({ error: "User Not Found", errorField: "email" });
    }

    const { uInt32 } = aleaRNGFactory(Date.now());
    const randomOtp = uInt32().toString().substring(0, 5);
    await UserModel.findOneAndUpdate(
      { email },
      { $set: { otp: randomOtp } },
      { new: true }
    );

    return res.status(200).send({ success: "OTP Code Sent Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const loginController = async (req, res) => {};

module.exports = {
  signUpController,
  userVerificationController,
  forgotPasswordController,
  loginController,
};
