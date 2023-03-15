require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const auth = require("./middlewares/auth");

// Global Middlewares
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/oauth2", require("./routes/oauth2"));
app.use("/users", auth, require("./routes/users"));
app.get("**", async (req, res) => res.sendStatus(401));

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

// Start app
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));
