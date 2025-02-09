const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");

const PasswordResetToken = require("../models/passwordResetToken");

const { isValidObjectId } = require("mongoose");
const user = require("../models/user");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helper");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "This email is already in use!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  //Generate 6 Digit OTP
  let OTP = generateOTP();

  //Store 6 Digit OTP inside our DB
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //Send 6 Digit OTP to the User

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
      <p>You verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    message: "Please verify your email. An OTP has been sent to your email.",
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return res.json({ error: "Invalid user!" });

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found", 404);

  if (user.isVerified) return sendError(res, "User is already verified");

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) return sendError(res, "token not found");

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please submit a valid OTP!");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "6f057acd1f4be1",
      pass: "97b71d7d3d32eb",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Welcome Email",
    html: `
      <h1>Welcome to our review app, thank you for choosing us</h1>
    `,
  });

  res.json({ message: "Your email is verified." });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found", 404);

  if (user.isVerified) return sendError(res, "User is already verified");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken)
    return sendError(res, "a new OTP can be requested after an hour");

  //Generate 6 Digit OTP
  let OTP = generateOTP();

  //Store 6 Digit OTP inside our DB
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //Send 6 Digit OTP to the User
  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Email Verification",
    html: `
      <p>You verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.json({ message: "New OTP has been sent to your registerd account" });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, "email is missing");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(res, "a new OTP can be requested after an hour");

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
      <p>Click here to reset password</p>
    <a href='${resetPasswordUrl}'>Change Password</a>
    `,
  });

  res.json({ message: "Link sent to your email." });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different than your old password"
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Password Reset Successful",
    html: `
      <h1>Your password has been reset</h1>
      <p>Please continue to sign in to use your password</p>
    `,
  });

  res.json({
    message:
      "Your password has been reset. Please continue to sign in to use your password",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return sendError(
      res,
      "Email or password you have entered does not match our records"
    );

  const { _id, name } = user;

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/Password is incorrect!");

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
