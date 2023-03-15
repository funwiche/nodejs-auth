const mongoose = require("mongoose");

module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      _id: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      name: String,
      image: String,
      password: String,
      verified: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      providers: { type: Array, default: ["email"] },
      lastLoggedIn: { type: Date, default: Date.now() },
      reset: { pin: Number, expiry: Number },
    },
    { timestamps: true }
  )
);
