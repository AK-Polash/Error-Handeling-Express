const nodemailer = require("nodemailer");

const mailSender = async (mailTo, ...rest) => {
  const [subject, template] = rest;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "polashk199@gmail.com",
        pass: "omggidpizbjreuyp",
      },
    });

    await transporter.sendMail({
      from: "polashk199@gmail.com",
      to: mailTo,
      subject: subject,
      html: template,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = mailSender;
