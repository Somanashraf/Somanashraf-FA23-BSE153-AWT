const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

// READ - sab data show karega
router.get("/", async (req, res) => {
  const users = await User.find();
  res.render("index", { users });
});

// CREATE - naya data save karega
router.post("/add", async (req, res) => {
  await User.create(req.body);
  res.redirect("/");
});

// UPDATE - data change karega
router.post("/update/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/");
});

// DELETE - data remove karega
router.get("/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

module.exports = router;