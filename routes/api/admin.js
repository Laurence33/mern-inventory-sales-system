const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Import middleware for authorization
const auth = require("../../middleware/auth");
const { authorizeAdmin, generateAccessToken } = auth;

// Import the Admin Model
const Admin = require("../../models/Admin");

/**
 * @route  GET api/admin/account
 * @desc   Get admin info
 * @access Private
 * @response JSON with the admin info
 */
router.get("/account", authorizeAdmin, (req, res) => {
  const admin = req.admin;
  Admin.findById(admin.id).then((admin) => {
    // Admin might be deleted
    if (!admin)
      return res.status(404).json({ message: "Admin account not found" });
    // Parse the admin info not to include password hash
    const adminInfo = {
      username: admin.username,
      id: admin.id,
    };

    return res.status(200).json(adminInfo);
  });
});

/**
 * @route  POST api/admin/username
 * @desc   Change admin username
 * @access Private
 * @response JSON with a message and admin object
 */
router.post("/username", authorizeAdmin, (req, res) => {
  const admin = req.admin;
  const { username } = req.body;

  Admin.findByIdAndUpdate(admin.id, { username: username }, { new: true }).then(
    (admin) => {
      // Admin might be deleted
      if (!admin)
        return res.status(404).json({ message: "Admin account not found." });
      // Should get the new Admin here
      // Parse the admin info not to include password hash
      const adminInfo = {
        username: admin.username,
        id: admin.id,
      };
      const newToken = generateAccessToken(adminInfo);
      return res.status(200).json({
        token: newToken,
        admin: adminInfo,
      });
    }
  );
});

/**
 * @route  POST api/admin/password
 * @desc   Change admin password
 * @access Private
 * @response JSON with a message and admin object
 */
router.post("/password", authorizeAdmin, (req, res) => {
  const admin = req.admin;
  const { password } = req.body;

  // Create Salt and Hash the password
  bcrypt.genSalt(10, (err, salt) => {
    // hash the password
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      const newPassword = hash;
      // Update admin password on database
      Admin.findByIdAndUpdate(
        admin.id,
        { password: newPassword },
        { new: true }
      ).then((admin) => {
        // Admin might be deleted
        if (!admin)
          return res.status(404).json({ message: "Admin account not found." });
        // Should get the new Admin here
        // Parse the admin info not to include password hash
        const adminInfo = {
          username: admin.username,
          id: admin.id,
        };
        const newToken = generateAccessToken(adminInfo);
        return res.status(200).json({
          token: newToken,
          admin: adminInfo,
        });
      });
    });
  });
});

module.exports = router;
