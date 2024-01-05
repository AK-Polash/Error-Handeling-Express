const verificationTemplate = (verificationToken) => {
  return `<p>Please click the following link to verify your account: <a href="http://localhost:3000/verify?token=${verificationToken}"> Verify Account </a> </p>`;
};

module.exports = verificationTemplate;
