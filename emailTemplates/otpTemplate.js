const otpTemplate = (otp) => {
  return `<p>Your password reset OTP code is <b>${otp}</b>. Insert the code to the match OTP page and finally reset the password.</p>`;
};

module.exports = otpTemplate;
