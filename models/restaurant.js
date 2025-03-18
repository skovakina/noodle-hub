const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  earnings_total: {
    type: Number,
    default: 0,
  },
  orders_completed: {
    type: Number,
    default: 0,
  },
  orders_failed: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
