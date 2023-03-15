const express = require("express");
const router = express.Router();
const User = require("../models/user");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const projection = { email: 1, name: 1, verified: 1, image: 1, disabled: 1 };
const uuid = require("uuid");

/** Register **/
router.post("/register", async (req, res) => {
  try {
    let { email, password, name } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json("user-already-exist");
    password = await bcrypt.hash(password, 10);
    const _id = uuid.v4();
    await new User({ _id, email, password, name }).save();
    res.status(200).json({
      token: JWT.sign(_id, SECRET),
      user: await User.findById(_id, projection),
    });
  } catch (error) {
    res.status(500).json("internal-server-error");
    console.log(error);
  }
});

/** Login **/
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("user-not-found");
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(403).json("incorrect-password");
    await User.updateOne(
      { email },
      { $set: { lastLoggedIn: new Date() } },
      { upsert: true }
    );
    res.status(200).json({
      token: JWT.sign(user._id, SECRET),
      user: await User.findById(user._id, projection),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("internal-server-error");
  }
});

/** Forgot Password **/
router.post("/forgot", async (req, res) => {
  try {
    let { email } = req.body;
    const expiry = Date.now() + 1800000;
    const pin = Math.floor(1000 + Math.random() * 9999);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json("user-not-found");
    await User.updateOne(
      { email },
      { $set: { reset: { expiry, pin } } },
      { upsert: true }
    );
    return res.status(200).json({ expiry, email, pin });
  } catch (error) {
    res.status(500).json("internal-server-error");
    console.log(error);
  }
});

/** Reset pin  **/
router.patch("/reset", async (req, res) => {
  try {
    let { pin, email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json("user-not-found");
    const { reset } = JSON.parse(JSON.stringify(user));
    if (reset.pin != pin) return res.status(403).json("incorrect-pin");
    if (Date.now() > reset.expiry) return res.status(410).json("pin-expired");
    password = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email },
      { $set: { password, verified: true }, $addToSet: { providers: "email" } },
      { upsert: true }
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json("internal-server-error");
    console.log(error);
  }
});

module.exports = router;
