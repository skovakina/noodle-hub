const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  noodle: [String],
  broth: [String],
  protein: [String],
  toppings: [String],
  drinks: [String],
});

module.exports = mongoose.model("Menu", menuSchema);
