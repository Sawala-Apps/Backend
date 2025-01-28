const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use(authRoutes);
app.use(feedRoutes);

module.exports = app;
