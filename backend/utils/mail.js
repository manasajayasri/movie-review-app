exports.generateOTP = (otp_length = 6) => {
  //Generate 6 Digit OTP

  let OTP = "";
  for (let i = 1; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }

  return OTP;
};

exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "6f057acd1f4be1",
      pass: "97b71d7d3d32eb",
    },
  });
