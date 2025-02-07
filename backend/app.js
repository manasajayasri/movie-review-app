const express = require("express");

const app = express();

// MVC - Modal view controller

app.get("/", (req, res) => {
  res.send("<h1>Hello I'm from your backend server</h1>");
});

app.get("/about", (req, res) => {
  res.send("<h1>Hello I'm from your backend server</h1>");
});

app.listen(8000, () => {
  console.log("The port is listening on port 8000");
});
