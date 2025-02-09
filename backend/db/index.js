const { default: mongoose } = require("mongoose");
const app = require("mongoose");

// const MONGO_URI = "mongodb://localhost:27017/review_app";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("db is connected!");
  })
  .catch((ex) => {
    console.log("db connection is lost.", ex);
  });
