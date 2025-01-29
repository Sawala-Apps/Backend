const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use(authRoutes);
app.use(feedRoutes);
app.use(profileRoutes);

module.exports = app;
