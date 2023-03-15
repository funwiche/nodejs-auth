const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/user");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const auth = require("../middlewares/auth");
const projection = { email: 1, name: 1, verified: 1, image: 1, disabled: 1 };
const uuid = require("uuid");

/** Google Login **/
router.get("/google", async (req, res) => {
  try {
    const query = queryString({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: get_redirect(req),
      scope:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`);
  } catch (err) {
    console.error(err);
  }
});

/** Google redirect **/
router.get("/google/redirect", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) res.sendStatus(402);
    const { data } = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: "post",
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: get_redirect(req),
        grant_type: "authorization_code",
        code,
      },
    });
    const user = await axios("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const authUser = await SignIn({
      name: user.data.name,
      email: user.data.email,
      image: user.data.picture,
      provider: "google",
    });
    res.status(200).json(authUser);
  } catch (err) {
    console.error(err);
  }
});

/** Facebook Login **/
router.get("/facebook", async (req, res) => {
  try {
    const query = queryString({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: get_redirect(req),
      scope:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
      scope: "email user_friends",
      response_type: "code",
    });
    res.redirect(`https://www.facebook.com/v4.0/dialog/oauth?${query}`);
  } catch (err) {
    console.error(err);
  }
});
/** Facebook redirect **/
router.get("/facebook/redirect", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) res.sendStatus(402);
    const { data } = await axios({
      url: "https://graph.facebook.com/v4.0/oauth/access_token",
      method: "post",
      data: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: get_redirect(req),
        code,
      },
    });
    const user = await axios(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${data.access_token}`
    );
    const authUser = await SignIn({
      name: user.data.name,
      email: user.data.email,
      avatar: user.data.picture.data.url,
      provider: "facebook",
    });
    res.status(200).json(authUser);
  } catch (err) {
    console.error(err);
  }
});

function get_redirect(req) {
  return `${req.protocol}://${req.get("host")}${req.originalUrl}/redirect`;
}
function queryString(query) {
  if (!typeof query == "object") return;
  return Object.entries(query)
    .map(([key, val]) => `${key}=${val}`)
    .join("&");
}

async function SignIn({ name, email, image, provider }) {
  try {
    const user = await User.findOne({ email });
    if (user) {
      await User.updateOne(
        { email },
        {
          $set: { lastLoggedIn: Date.now() },
          $addToSet: { providers: provider },
        },
        { upsert: true }
      );
      const user = await Post.findById(user._id, projection);
      const token = JWT.sign(user._id, SECRET);
      return { user, token };
    } else {
      const _id = uuid.v4();
      await new User({
        _id,
        name,
        image,
        email,
        providers: [provider],
      }).save();
      const user = await Post.findById(_id, projection);
      const token = JWT.sign(_id, SECRET);
      return { user, token };
    }
  } catch (error) {
    throw error;
  }
}

module.exports = router;
