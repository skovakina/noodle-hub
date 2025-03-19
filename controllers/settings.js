const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Restaurant = require("../models/restaurant");

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

router.post("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    if (!user) return res.status(404).send("User not found");

    user.name = req.body.name;
    user.email = req.body.email;

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

router.post("/restaurant/delete", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.session.user._id,
    });

    if (!restaurant) return res.status(404).send("Restaurant not found");

    if (req.body.confirmName !== restaurant.name) {
      return res.redirect("/settings?error=wrong-name");
    }

    await Restaurant.findByIdAndDelete(restaurant._id);
    res.redirect("/settings?success=deleted");
  } catch (error) {
    console.error(error);
    res.redirect("/settings");
  }
});

module.exports = router;
