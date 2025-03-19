const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");

// ✅ GET /settings - Render settings page
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const restaurant = await Restaurant.findOne({ owner: user._id });

    res.render("settings/index.ejs", { user, restaurant });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

// ✅ POST /settings/profile - Update user profile
router.post("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    if (!user) return res.status(404).send("User not found");

    user.name = req.body.name;
    user.email = req.body.email;

    // Only update password if a new one is provided
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 10);
    }

    await user.save();
    res.redirect("/settings");
  } catch (error) {
    console.error(error);
    res.redirect("/settings");
  }
});

// ✅ POST /settings/restaurant - Update restaurant name
router.post("/restaurant", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.session.user._id,
    });

    if (!restaurant) return res.status(404).send("Restaurant not found");

    restaurant.name = req.body.name;
    await restaurant.save();

    res.redirect("/settings");
  } catch (error) {
    console.error(error);
    res.redirect("/settings");
  }
});

// ✅ POST /settings/restaurant/delete - Delete restaurant
router.post("/restaurant/delete", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.session.user._id,
    });

    if (!restaurant) return res.status(404).send("Restaurant not found");

    await Restaurant.findByIdAndDelete(restaurant._id);
    res.redirect("/settings");
  } catch (error) {
    console.error(error);
    res.redirect("/settings");
  }
});

module.exports = router;
