const express = require("express");
const Order = require("../models/order");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { items, total_price, status } = req.body;

    if (!Array.isArray(items)) {
      items = [items];
    }

    const order = new Order({
      items,
      total_price: parseFloat(total_price),
      status,
    });

    await order.save();
    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  try {
    let { items, total_price, status } = req.body;

    if (!Array.isArray(items)) {
      items = [items];
    }

    await Order.findByIdAndUpdate(req.params.id, {
      items,
      total_price: parseFloat(total_price),
      status,
    });

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

module.exports = router;
