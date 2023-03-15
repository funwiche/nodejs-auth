const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const projection = { email: 1, name: 1, verified: 1, image: 1, disabled: 1 };

/** Get Auth User **/
router.get("", async (req, res) => {
  try {
    res.status(200).json(await User.findById(req.user, projection));
  } catch (err) {
    console.error(err);
  }
});

/** Change Password **/
router.patch("/password", async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json("user-not-found");
    let { password, newpassword } = req.body;
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(403).json("incorrect-password");
    password = await bcrypt.hash(newpassword, 10);
    await User.updateOne(
      { _id: req.user },
      { $set: { password } },
      { upsert: true }
    );
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(500).json("internal-server-error");
  }
});

/** Update Name **/
router.patch("/name", async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json("user-not-found");
    await User.updateOne(
      { _id: req.user },
      { $set: { name: req.body.name || user.name } },
      { upsert: true }
    );
    res.status(200).json(await User.findById(req.user, projection));
  } catch (err) {
    console.log(err);
    res.status(500).json("internal-server-error");
  }
});

/** Update User Profile **/
router.patch("/email", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json("user-not-found");
    if (user.email === email) return res.sendStatus(200);
    if (await User.findOne({ email }))
      return res.status(409).json("email-already-exist");
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(403).json("incorrect-password");
    await User.updateOne(
      { _id: req.user },
      { $set: { email }, $addToSet: { providers: "email" } },
      { upsert: true }
    );
    res.status(200).json(await User.findById(req.user, projection));
  } catch (err) {
    console.log(err);
    res.status(500).json("internal-server-error");
  }
});

/** Delete User with token**/
router.delete("", async (req, res) => {
  try {
    const user = User.findById(req.user);
    if (!user) return res.status(404).json("user-not-found");
    await user.remove();
    res.sendStatus(200);
  } catch (err) {
    return res.status(500).json("internal-server-error");
  }
});
module.exports = router;
