const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  noodle: { type: String, required: true },
  broth: { type: String, required: true },
  protein: { type: String, required: true },
  toppings: [{ type: String }],
  drinks: [{ type: String }],
  total_price: { type: Number, required: true },
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
