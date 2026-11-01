
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
      return res.status(400).json({
        message: "Login is not configured correctly."
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Incorrect admin password."
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Admin login successful.",
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed." });
  }
});

module.exports = router;
