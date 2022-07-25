const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

// Initialize Express Router
const router = express.Router();

// Import User Schema
const User = require("../../models/User");
// Import Admin Schema
const Admin = require("../../models/Admin");

// Import needed functions for token
const auth = require("../../middleware/auth");
const { generateAccessToken, generateRefreshToken } = auth;

/**
 * @route POST api/auth/login
 * @desc Login a user
 * @access Public
 * @response JSON, with message, accessToken, user on SUCCESS, otherwise message only
 */
router.post("/login", (req, res) => {
  // Destructuring req.body
  const { email, password } = req.body;

  // Simple Validation
  if (!email || !password)
    return res.status(400).json({ message: "Please provide all fields" });

  // Check if user exists
  User.findOne({ email }).then((user) => {
    // If email is not found, return an error
    if (!user) return res.status(400).json({ message: "User does not exits" });

    // User is found, check password
    bcrypt.compare(password, user.password).then(async (isMatch) => {
      // wrong password
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      const accessToken = generateAccessToken(userInfo);
      // if the token is not generated, send a 500 response
      if (!accessToken)
        return res
          .status(500)
          .json({ message: "We cannot log you in securely, please try again" });

      // Token is generated
      const refreshToken = generateRefreshToken(userInfo);
      if (!refreshToken)
        return res
          .status(500)
          .json({ message: "We cannot log you in securely, please try again" });

      res.cookie("refresh-token", refreshToken, { httpOnly: true }); // add secure=true on production
      return res.status(200).json({
        accessToken: accessToken,
        user: userInfo,
      });
    });
  });
});

/**
 * @route POST /api/auth/refresh
 * @desc Generate a new access token for the user
 * @access Private
 * @response HTTP/1.1 403/500/200
 */
router.post("/refresh", (req, res) => {
  if (!req.cookies["refresh-token"]) {
    // User don't have a token
    return res.sendStatus(403).json({ message: "You are not logged in." });
  }
  jwt.verify(
    req.cookies["refresh-token"],
    config.get("REFRESH_TOKEN_SECRET"),
    (err, user) => {
      // If token is not valid
      if (err) return res.sendStatus(403).json({ message: "Invalid token." });

      User.findById(user.id).then((user) => {
        // User might be deleted
        if (!user) return res.status(401).json({ message: "User not found." });

        const userNew = {
          name: user.name,
          email: user.email,
          id: user.id,
        };

        const newAccessToken = generateAccessToken(userNew);
        if (!newAccessToken)
          return res.status(500).json({
            message: "We cannot log you in securely, please try again",
          });

        return res
          .status(200)
          .json({ accessToken: newAccessToken, user: userNew });
      });
    }
  );
});

/**
 * @route DELETE /api/auth/logout
 * @desc  Logout a user/admin, removes refresh token from cookie
 * @access Private
 * @response 204 No Content
 */
router.delete("/logout", (req, res) => {
  // Check if logged in (has refresh-token)
  if (!req.cookies["refresh-token"])
    return res.status(403).json({ message: "You are not logged in." });

  // Remove the refresh token
  res.cookie("refresh-token", "", { maxAge: 0 });
  res.sendStatus(204);
});

/**
 * @route POST api/auth/admin
 * @desc Login admin
 * @access Public
 * @response JSON, with message, accessToken, user on SUCCESS, otherwise message only
 */
router.post("/admin", (req, res) => {
  // Destructuring req.body
  const { username, password } = req.body;

  // Simple Validation
  if (!username || !password)
    return res.status(400).json({ message: "Please provide all fields" });

  // Check if user exists
  Admin.findOne({ username }).then((admin) => {
    // If username is not found, return an error
    if (!admin)
      return res.status(400).json({ message: "Admin account does not exits" });

    // User is found, check password
    bcrypt.compare(password, admin.password).then(async (isMatch) => {
      // wrong password
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      await Admin.findOneAndUpdate(
        { username: admin.username },
        { date_logged_in: Date.now() },
        { new: true }
      );

      const adminInfo = {
        id: admin.id,
        username: admin.username,
      };

      const accessToken = generateAccessToken(adminInfo);
      // if the token is not generated, send a 500 response
      if (!accessToken)
        return res
          .status(500)
          .json({ message: "We cannot log you in securely, please try again" });

      // Token is generated
      const refreshToken = generateRefreshToken(adminInfo);
      if (!refreshToken)
        return res
          .status(500)
          .json({ message: "We cannot log you in securely, please try again" });

      res.cookie("refresh-token", refreshToken, { httpOnly: true }); // add secure=true on production
      return res.status(200).json({
        accessToken: accessToken,
        admin: adminInfo,
      });
    });
  });
});

/**
 * @route GET /api/auth/admin
 * @desc Generate a new access token for admin
 * @access Private
 * @response HTTP/1.1 403/500/200
 */
router.get("/admin", (req, res) => {
  if (!req.cookies["refresh-token"]) {
    // Admin don't have a token
    return res.sendStatus(403).json({ message: "You are not logged in." });
  }
  jwt.verify(
    req.cookies["refresh-token"],
    config.get("REFRESH_TOKEN_SECRET"),
    (err, admin) => {
      // If token is not valid
      if (err) return res.sendStatus(403).json({ message: "Invalid token." });

      Admin.findById(admin.id)
        .then((admin) => {
          // Admin might be deleted
          if (!admin)
            return res
              .status(401)
              .json({ message: "Admin account not found." });

          const adminNew = {
            username: admin.username,
            id: admin.id,
          };

          const newAccessToken = generateAccessToken(adminNew);
          if (!newAccessToken)
            return res.status(500).json({
              message: "We cannot log you in securely, please try again",
            });

          return res
            .status(200)
            .json({ accessToken: newAccessToken, admin: adminNew });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ message: "Something went wrong please try again." });
        });
    }
  );
});

module.exports = router;
