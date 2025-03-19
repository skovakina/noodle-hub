const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const bcrypt = require("bcrypt");

const authController = require("./controllers/auth.js");
const restaurantController = require("./controllers/restaurant.js");
const ordersController = require("./controllers/orders.js");
const settingsController = require("./controllers/settings.js");

const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

const User = require("./models/user"); //todo: remove autologin

const port = process.env.PORT ? process.env.PORT : "5000";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);

// 📌 Auto-login Middleware (Inside server.js)
app.use(async (req, res, next) => {
  if (!req.session.user) {
    let user = await User.findOne({ name: "test_user" });

    if (!user) {
      user = new User({
        name: "test_user",
        email: "test@example.com",
        password: bcrypt.hashSync("12", 10),
      });

      await user.save();
    }

    req.session.user = { _id: user._id, name: user.name };
    console.log("Auto-logged in as test user");
  }

  next();
});

app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.use("/auth", authController);
app.use(isSignedIn);
app.use("/restaurant", restaurantController);
app.use("/orders", ordersController);
app.use("/settings", settingsController);

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
