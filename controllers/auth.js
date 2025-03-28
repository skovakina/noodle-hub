const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/user.js");

router.get("/sign-up", (req, res) => {
  if (req.session.user) return res.redirect("/restaurant");
  res.render("auth/sign-up.ejs");
});

router.get("/sign-in", (req, res) => {
  if (req.session.user) return res.redirect("/restaurant");
  res.render("auth/sign-in.ejs");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.post("/sign-up", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user) {
      return res.render("error.ejs", {
        message: "Username already taken. Please choose another one.",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.render("error.ejs", {
        message: "Password and Confirm Password must match",
      });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    await User.create(req.body);

    res.redirect("/auth/sign-in");
  } catch (error) {
    console.log(error);
    res.render("error.ejs", {
      message: "Something went wrong. Please try again later.",
    });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    console.log(user);
    if (!user) {
      return res.render("error.ejs", {
        message: "Login failed. Please check your credentials and try again.",
      });
    }

    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.render("error.ejs", {
        message: "Login failed. Please check your credentials and try again.",
      });
    }

    req.session.user = {
      name: user.name,
      _id: user._id,
    };

    res.redirect("/restaurant");
  } catch (error) {
    console.log(error);
    res.render("error.ejs", {
      message: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;
