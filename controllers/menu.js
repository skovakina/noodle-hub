const express = require("express");
const router = express.Router();
const Menu = require("../models/menu");
const Restaurant = require("../models/restaurant");

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
  const userId = req.session.user._id;
  const restaurant = await Restaurant.findOne({ owner: userId });

  if (!restaurant) return res.redirect("/restaurant/new");

  let menu = await Menu.findOne({ restaurant: restaurant._id });

  if (!menu) {
    menu = new Menu({ restaurant: restaurant._id, ...defaultOptions });
    await menu.save();
  }

  res.render("menu/edit.ejs", { restaurant, menu, defaultOptions });
});

router.post("/", async (req, res) => {
  const userId = req.session.user._id;
  const restaurant = await Restaurant.findOne({ owner: userId });

  if (!restaurant) return res.redirect("/restaurant/new");

  const { noodle, broth, protein, toppings, drinks } = req.body;

  await Menu.findOneAndUpdate(
    { restaurant: restaurant._id },
    {
      noodle: Array.isArray(noodle) ? noodle : [noodle].filter(Boolean),
      broth: Array.isArray(broth) ? broth : [broth].filter(Boolean),
      protein: Array.isArray(protein) ? protein : [protein].filter(Boolean),
      toppings: Array.isArray(toppings) ? toppings : [toppings].filter(Boolean),
      drinks: Array.isArray(drinks) ? drinks : [drinks].filter(Boolean),
    },
    { new: true, upsert: true }
  );

  res.redirect("/menu");
});

module.exports = router;
