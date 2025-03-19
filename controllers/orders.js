const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Item = require("../models/item");
const Restaurant = require("../models/restaurant");

const options = {
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

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomToppings = (arr, count = 3) => {
  let shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

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

    res.render("orders/index.ejs", { restaurant, orderFilter: "all" });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/pending", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId }).populate({
      path: "orders",
      populate: { path: "item" },
    });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }

    res.render("orders/index.ejs", { restaurant, orderFilter: "pending" });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/completed", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId }).populate({
      path: "orders",
      populate: { path: "item" },
    });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }

    res.render("orders/index.ejs", { restaurant, orderFilter: "completed" });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/failed", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId }).populate({
      path: "orders",
      populate: { path: "item" },
    });

    if (!restaurant) {
      return res.redirect("/restaurant/new");
    }

    res.render("orders/index.ejs", { restaurant, orderFilter: "failed" });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const restaurant = await Restaurant.findOne({ owner: userId });
    const totalPrice = (Math.random() * (18 - 12) + 12).toFixed(2);
    const randomItem = new Item({
      noodle: getRandomElement(options.noodle),
      broth: getRandomElement(options.broth),
      protein: getRandomElement(options.protein),
      toppings: getRandomToppings(options.toppings, 3),
      drinks: getRandomToppings(options.drinks, 1),
      total_price: totalPrice,
    });

    await randomItem.save();

    const newOrder = new Order({
      item: randomItem._id,
      total_price: totalPrice,
      status: "pending",
    });

    await newOrder.save();

    restaurant.orders.push(newOrder._id);
    await restaurant.save();

    res.redirect("/orders");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("item");
    if (!order) return res.status(404).send("Order not found");

    const restaurant = await Restaurant.findOne({ orders: order._id });
    if (!restaurant) return res.status(404).send("Restaurant not found");

    res.render("orders/order.ejs", {
      order,
      restaurant,
      options,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/orders");
  }
});

router.post("/:id/verify", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("item");
    if (!order) return res.status(404).send("Order not found");

    const restaurant = await Restaurant.findOne({ orders: order._id });
    if (!restaurant) return res.status(404).send("Restaurant not found");

    const { noodle, broth, protein, toppings, drinks } = req.body;

    const selectedNoodle = noodle || "";
    const selectedBroth = broth || "";
    const selectedProtein = protein || "";
    const selectedToppings = Array.isArray(toppings)
      ? toppings
      : [toppings].filter(Boolean);
    const selectedDrinks = Array.isArray(drinks)
      ? drinks
      : [drinks].filter(Boolean);

    const correctNoodle = order.item.noodle;
    const correctBroth = order.item.broth;
    const correctProtein = order.item.protein;
    const correctToppings = order.item.toppings.sort();
    const correctDrinks = order.item.drinks.sort();

    const isCorrect =
      selectedNoodle === correctNoodle &&
      selectedBroth === correctBroth &&
      selectedProtein === correctProtein &&
      JSON.stringify(selectedToppings.sort()) ===
        JSON.stringify(correctToppings) &&
      JSON.stringify(selectedDrinks.sort()) === JSON.stringify(correctDrinks);

    if (isCorrect) {
      order.status = "completed";
      order.rating = 5;
    } else {
      order.status = "failed";
      order.rating = 0;
    }
    await order.save();

    // calculate restaurant stats
    const allOrders = await Order.find({ _id: { $in: restaurant.orders } });

    // Compute updated stats
    restaurant.orders_completed = allOrders.filter(
      (o) => o.status === "completed"
    ).length;
    restaurant.orders_failed = allOrders.filter(
      (o) => o.status === "failed"
    ).length;
    restaurant.earnings_total = allOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // Calculate average rating from completed orders
    const completedOrders = allOrders.filter((o) => o.status === "completed");
    if (completedOrders.length > 0) {
      const totalRating = completedOrders.reduce((sum, o) => sum + o.rating, 0);
      restaurant.rating = totalRating / completedOrders.length;
    } else {
      restaurant.rating = 0; // Reset if no completed orders
    }

    await restaurant.save();

    res.redirect("/orders");
  } catch (error) {
    console.error(error);
    res.redirect("/restaurant");
  }
});

module.exports = router;
