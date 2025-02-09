const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const userRouter = require("./routes/user");
const { errorHandler } = require("./middlewares/error");
const { default: mongoose } = require("mongoose");
require("dotenv").config(); //FAM. I loaded this after ./db, and it crashed the app. FAMM. 10 min of my life gone fo dis.
require("./db");
const PORT = 8000;
// console.log("MONGO_URI:", process.env.MONGO_URI); //Debug

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/user", userRouter);

app.use(errorHandler);

// app.post(
//   "/sign-in",
//   (req, res, next) => {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.json({ error: "email/password is missing" });
//     // next(); //Middleware funtion, it will decide if we want to move to next funtion
//     next();
//   },
//   (req, res) => {
//     res.send("<h1>Hello I'm from your backend server</h1>");
//   }
// );

app.listen(8000, () => {
  console.log(`Server running on port ${PORT}`);
});
