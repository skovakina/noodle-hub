const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Restaurant = require("../models/restaurant");

router.get("/", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }

    const formattedCreatedAt = new Date(
      restaurant.createdAt
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const stats = {
      totalOrders: restaurant.orders.length,
      completedOrders: restaurant.orders_completed,
      failedOrders: restaurant.orders_failed,
      pendingOrders:
        restaurant.orders.length -
        (restaurant.orders_completed + restaurant.orders_failed),
      totalEarnings: restaurant.earnings_total.toFixed(2),
      averageRating: restaurant.rating.toFixed(1),
      createdAt: formattedCreatedAt,
    };

    res.render("restaurant/index.ejs", { restaurant, stats });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/new", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const existingRestaurant = await Restaurant.findOne({ owner: userId });

    if (existingRestaurant) {
      return res.redirect(`/orders`);
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
    res.redirect("/orders", { restaurant: newRestaurant });
  } catch (error) {
    console.log(error);
    res.redirect("/restaurant/new");
  }
});

module.exports = router;
