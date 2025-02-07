const { default: mongoose } = require("mongoose");
const app = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/review_app")
  .then(() => {
    console.log("db is connected!");
  })
  .catch((ex) => {
    console.log("db connection is lost.", ex);
  });
