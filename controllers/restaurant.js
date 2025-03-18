const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Restaurant = require("../models/restaurant");

console.log("restaurant controller");

router.get("/", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId }).populate({
      path: "orders",
      populate: { path: "item" },
    });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }
    console.log(restaurant);
    res.render("restaurant/index.ejs", { restaurant });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const existingRestaurant = await Restaurant.findOne({ owner: userId });

    if (existingRestaurant) {
      return res.redirect(`/restaurant`);
    }

    res.render("restaurant/new.ejs");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    const newRestaurant = new Restaurant({
      name: req.body.name,
      owner: user._id,
    });

    await newRestaurant.save();
    res.redirect("/restaurant", { restaurant: newRestaurant });
  } catch (error) {
    console.log(error);
    res.redirect("/restaurant/new");
  }
});

module.exports = router;
