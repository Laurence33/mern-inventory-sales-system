const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cookieParser = require("cookie-parser");

const app = express();

// To be able to parse json body
app.use(express.json());
// To be able to work with cookies
app.use(cookieParser());

// Load mongo config
const db = config.get("mongoURI");

// Connect to Mongo
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/products", require("./routes/api/products"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/orders", require("./routes/api/orders"));

// declare routes
app.get("/", (req, res) => {
  console.log("Someone connected");
  if (req.cookies["refresh-token"])
    console.log("Sent a cookie", req.cookies["refresh-token"]);
  const dateOptions = {
    timeZone: "Philippines/Manila",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const date = Date(Date.now());
  const phDate = date.toLocaleString("en-US", {
    timeZone: "Philippines/Manila",
  });
  res.status(201).json({ message: "Hello from server", date: date });
});

/**
 * @route  GET /developer
 * @desc   Get Developer information
 * @access Public
 * @response JSON containing some details about the developer
 */
app.get("/developer", (req, res) => {
  res
    .status(200)
    .json({
      developedBy: "Laurence N. Cortez",
      month: "August, 2021",
      facebook: "www.facebook.com/laurence.cortez19",
    });
});

// Get port from env and set a default port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started at port ${port}`));
