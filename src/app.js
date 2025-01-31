const express = require("express");
const cors = require("cors");
// const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const followRoutes = require("./routes/followRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Middleware
app.use(cors());
// app.use(helmet());
app.use(express.json());

// Routes
app.use(authRoutes);
app.use(feedRoutes);
app.use(profileRoutes);
app.use(followRoutes);
app.use(likeRoutes);
app.use(commentRoutes);

module.exports = app;