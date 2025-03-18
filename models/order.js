const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

orderSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
