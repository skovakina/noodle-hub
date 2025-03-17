const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Recipe = require("../models/recipe");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.render("users/index.ejs", { users });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.redirect("/users");

    const recipes = await Recipe.find({ owner: user._id });

    res.render("users/show.ejs", { user, recipes });
  } catch (error) {
    console.error(error);
    res.redirect("/users");
  }
});

module.exports = router;
