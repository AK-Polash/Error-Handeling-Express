require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const aleaRNGFactory = require("number-generator/lib/aleaRNGFactory");
const UserModel = require("../models/userModel");
const {
  nameValidator,
  emailValidator,
  passwordValidator,
} = require("../utils/validators");
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

const matchOtpController = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .send({ error: "Untracked Email", errorField: "otp" });
    }

    if (!existingUser.otp) {
      return res
        .status(400)
        .send({ error: "Already Matched OTP", errorField: "otp" });
    }

    if (existingUser.otp !== otp) {
      return res
        .status(404)
        .send({ error: "OTP Does Not Match", errorField: "otp" });
    }

    await UserModel.updateOne(
      { email },
      { $unset: { otp: "" } },
      { new: true }
    );
    return res.status(200).send({ success: "OTP Matched Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const resetPasswordController = async (req, res) => {
  const { password, email } = req.body;
  if (passwordValidator(res, password, "password")) {
    return;
  } else if (!email) {
    return res
      .status(400)
      .send({ error: "Untracked User", errorField: "password" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: hash },
      { new: true }
    );

    if (user === null) {
      return res
        .status(404)
        .send({ error: "User Not Found", errorField: "password" });
    }

    return res.status(200).send({ success: "Password Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (emailValidator(res, email, "email")) {
    return;
  } else if (!password) {
    return res
      .status(400)
      .send({ error: "Password Is Required", errorField: "password" });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .send({ error: "User Not Found", errorField: "email" });
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (match) {
      return res.status(200).send({ success: "Login Successfully" });
    } else {
      return res
        .status(401)
        .send({ error: "Crediential Error Occured", errorField: "password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const allUsersController = async (req, res) => {
  try {
    const allUsers = await UserModel.find({}).select({ password: 0, __v: 0 });
    if (allUsers.length < 1) {
      return res.status(404).send({ error: "Empty User List" });
    }

    return res.status(200).send({
      success: "Users Found Successfully",
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = {
  signUpController,
  userVerificationController,
  forgotPasswordController,
  matchOtpController,
  resetPasswordController,
  loginController,
  allUsersController,
};
