const user = require("../models/user");
const User = require("../models/user");

exports.create = async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  const oldUser = await user.findOne({ email });
  // return console.log(oldUser);

  if (oldUser)
    return res.status(401).json({ error: "This email is already in use!" });

  const newUser = new User({ name, email, password });
  await newUser.save();
  res.json({ user: newUser });
};
