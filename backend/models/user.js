const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userScema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

userScema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userScema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userScema);
