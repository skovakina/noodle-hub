const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Restaurant = require("../models/restaurant");
const Order = require("../models/order");
const Item = require("../models/item");
const Menu = require("../models/menu");

const defaultOptions = {
  noodle: ["Ramen", "Udon", "Soba", "Rice Noodles", "Egg Noodles"],
  broth: ["Pork Bone Broth", "Miso", "Vegetable Broth", "Chicken Broth"],
  protein: ["Pork", "Chicken", "Tofu"],
  toppings: [
    "Soft-Boiled Egg",
    "Scallions",
    "Baby Spinach",
    "Corn",
    "Tofu (Fried or Silken)",
    "Bamboo Shoots",
    "Wood Ear Mushrooms",
    "Crispy Garlic",
    "Shrimp",
    "Bean Sprouts",
    "Nori (Seaweed)",
    "Chili Oil",
  ],
  drinks: ["Green Tea", "Soda", "Thai Iced Tea"],
};

router.get("/", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }

    const existingMenu = await Menu.findOne({ restaurant: restaurant._id });

    if (!existingMenu) {
      const newMenu = new Menu({
        restaurant: restaurant._id,
        ...defaultOptions,
      });
      await newMenu.save();
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

    const recentOrders = await Order.find({ _id: { $in: restaurant.orders } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("item");

    res.render("restaurant/index.ejs", { restaurant, stats, recentOrders });
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

    const newMenu = new Menu({
      restaurant: newRestaurant._id,
      ...defaultOptions,
    });

    await newMenu.save();

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    res.redirect("/restaurant/new");
  }
});

module.exports = router;
