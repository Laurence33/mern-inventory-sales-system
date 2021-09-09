const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Import middleware for authorization
const auth = require("../../middleware/auth");
const { authorize, generateAccessToken } = auth;

// Import the User Model
const User = require("../../models/User");

router.get("/", (req, res) => {
  console.log("Someone accessed the user route.");
  res
    .status(201)
    .json({ message: "Hello here are my info", name: "Laurence Cortez" });
});

/**
 * @route  POST api/users/email
 * @desc   Change user email
 * @access Private
 * @response JSON with a message and user
 */
router.post("/email", authorize, (req, res) => {
  const user = req.user;
  const newEmail = req.body.email;

  User.findByIdAndUpdate(user.id, { email: newEmail }, { new: true }).then(
    (user) => {
      // User might be deleted
      if (!user) return res.status(404).json({ message: "Account not found" });
      // Should get the new user here
      // Parse the user info not to include password hash
      const userInfo = {
        name: user.name,
        email: user.email,
        id: user.id,
      };
      const newToken = generateAccessToken(userInfo);
      return res.status(200).json({
        message: "User information retrieved",
        token: newToken,
        user: userInfo,
      });
    }
  );
});

/**
 * @route  POST api/users/update
 * @desc   Change account details
 * @access Private
 * @response JSON with a message and user
 */
router.post("/update", authorize, (req, res) => {
  const user = req.user;
  const newDetails = req.body;

  User.findByIdAndUpdate(
    user.id,
    { name: newDetails.name },
    { new: true }
  ).then((user) => {
    // User might be deleted
    if (!user) return res.status(404).json({ message: "Account not found" });
    // Should get the new user here
    // Parse the user info not to include password hash
    const userInfo = {
      name: user.name,
      email: user.email,
      id: user.id,
    };
    const newToken = generateAccessToken(userInfo);
    return res.status(200).json({
      message: "User information updated",
      token: newToken,
      user: userInfo,
    });
  });
});

/**
 * @route  GET api/users/user
 * @desc   Get user info
 * @access Private
 * @response JSON with a message and user
 */
router.get("/user", authorize, (req, res) => {
  const user = req.user;
  User.findById(user.id).then((user) => {
    // User might be deleted
    if (!user) return res.status(404).json({ message: "Account not found" });
    // Parse the user info not to include password hash
    const userInfo = {
      name: user.name,
      email: user.email,
      id: user.id,
    };

    return res
      .status(200)
      .json({ message: "User information retrieved", user: userInfo });
  });
});

/**
 * @route  POST api/users/register
 * @desc   Register a new User
 * @access Public
 * @response JSON with a message
 */
router.post("/register", (req, res) => {
  // Destructuring the request body
  const { name, email, password } = req.body;

  // if there are missing fields, send a response: 400 Bad Request
  if (!name || !email || !password)
    return res.status(400).json({ message: "Please provide all information." });

  // All fields are provided, check if the email is in use
  User.findOne({ email }).then((user) => {
    // If we find a match, email is in use, return a response: 400 Bad Request
    if (user)
      return res.status(400).json({ message: "Email already registered." });

    const newUser = new User({
      name,
      email,
      password,
    });

    // Create Salt and Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      // hash the password
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        // Set the hash as user password before saving to database
        newUser.password = hash;
        // Try to save user to database
        newUser.save().then((user) => {
          // User is saved
          return res.status(201).json({ message: "You are now registered." });
        });
      });
    });
  });
});

// TODO: Implement Change User Password

/**
 * @route  POST api/users/admin
 * @desc   Register a new admin
 * @access Public
 * @response JSON with a message
 */
router.post("/admin", (req, res) => {
  // Destructuring the request body
  const { username, password } = req.body;

  // if there are missing fields, send a response: 400 Bad Request
  if (!username || !password)
    return res.status(400).json({ message: "Please provide all information." });

  // All fields are provided, check if the username is in use
  Admin.findOne({ username }).then((user) => {
    // If we find a match, username is in use, return a response: 400 Bad Request
    if (user)
      return res.status(400).json({ message: "Username already in use." });

    const newAdmin = new Admin({
      username,
      password,
    });

    // Create Salt and Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      // hash the password
      bcrypt.hash(newAdmin.password, salt, (err, hash) => {
        if (err) throw err;
        // Set the hash as admin password before saving to database
        newAdmin.password = hash;
        // Try to save user to database
        newAdmin.save().then((admin) => {
          // Admin is saved
          return res
            .status(201)
            .json({ message: "New Admin account is registered." });
        });
      });
    });
  });
});

module.exports = router;
