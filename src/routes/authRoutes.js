const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register
router.post("/auth/register", authController.register);

// Login
router.post("/auth/login", authController.login);

module.exports = router;
