require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/userRoutes"));

app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);