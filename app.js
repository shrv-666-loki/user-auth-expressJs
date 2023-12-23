const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appRoutes = require("./routes/users");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", appRoutes);

app.use("*", (req, res) => {
  return res.status(404).json("route not found");
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(port);
    console.log(`server is listening on ${port}`);
  })
  .catch((err) => {
    console.log(err);
  });

