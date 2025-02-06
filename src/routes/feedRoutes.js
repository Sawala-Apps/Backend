const express = require("express");
const multer = require("multer");
const router = express.Router();
const feedController = require("../controllers/feedController");
const authMiddleware = require("../middlewares/authMiddleware");

// Setup multer for handling file uploads
const upload = multer({ dest: "temp/feeds/" }); // File sementara akan disimpan di folder temp/

// Middleware untuk proteksi endpoint
router.use(authMiddleware);

// Get all feeds
router.get("/feeds", feedController.getFeeds);

// Create a feed
router.post("/feeds", upload.single("mediaFiles"), feedController.createFeed);

// Edit a feed (PATCH)
router.patch("/feeds/:postid", upload.single("mediaFiles"), feedController.editFeed);

// Delete a feed
router.delete("/feeds/:postid", feedController.deleteFeed);

// Get feed details
router.get("/feeds/:postid", feedController.getFeedDetails);

module.exports = router;