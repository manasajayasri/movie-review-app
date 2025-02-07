const express = require("express");
const userRouter = require("./routes/user");
const { default: mongoose } = require("mongoose");
require("./db");
const PORT = 8000;

const app = express();
app.use(express.json());
app.use("/api/user", userRouter);

app.post(
  "/sign-in",
  (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ error: "email/password is missing" });
    // next(); //Middleware funtion, it will decide if we want to move to next funtion
    next();
  },
  (req, res) => {
    res.send("<h1>Hello I'm from your backend server</h1>");
  }
);

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});
