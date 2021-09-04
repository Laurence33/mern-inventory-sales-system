const config = require("config");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

function authorize(req, res, next) {
  // Get token from  header
  const token = req.header("x-auth-token");

  // Check if token exists
  if (!token)
    return res.status(401).json({ message: "No token, unauthorized." });

  try {
    // Verify token
    const decoded = jwt.verify(token, config.get("ACCESS_TOKEN_SECRET"));

    // Parse the user
    const userInfo = {
      name: decoded.name,
      email: decoded.email,
      id: decoded.id,
    };
    // Add user to payload
    req.user = userInfo;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function authorizeAdmin(req, res, next) {
  // Get token from  header
  const token = req.header("x-auth-token");

  // Check if token exists
  if (!token)
    return res.status(401).json({ message: "No token, unauthorized." });

  try {
    // Verify token
    const decoded = jwt.verify(token, config.get("ACCESS_TOKEN_SECRET"));

    Admin.findById(decoded.id).then((admin) => {
      if (!admin)
        return res.status(403).json({ message: "You are not authorized" });

      // Parse the admin info
      const adminInfo = {
        username: admin.username,
        id: admin.id,
      };
      // Add admin to payload
      req.admin = adminInfo;
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function generateAccessToken(user) {
  const options = {
    expiresIn: 3600, //1Hr
  };
  return jwt.sign(user, config.get("ACCESS_TOKEN_SECRET"), options);
}

function generateRefreshToken(user) {
  return jwt.sign(user, config.get("REFRESH_TOKEN_SECRET"));
}

module.exports = {
  authorize,
  authorizeAdmin,
  generateAccessToken,
  generateRefreshToken,
};
