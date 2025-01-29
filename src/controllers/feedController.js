const { v4: uuidv4 } = require("uuid");
const feedModel = require("../models/feedModel");
const { uploadFeedMedia, deleteFeedMedia} = require("../utils/feedUpload");

// Get all feeds
exports.getFeeds = async (req, res) => {
  try {
    const { uid } = req.user;
    const feeds = await feedModel.getFeeds(uid);
    res.status(200).json({ feeds });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a feed
exports.createFeed = async (req, res) => {
  try {
    const { uid } = req.user;
    const { contentText } = req.body;

    // Generate unique post ID
    const postid = uuidv4();

    // Upload files via utility function
    const mediaFolderPath = await uploadFeedMedia(req.files, uid, postid);

    // Save feed to database
    await feedModel.createFeed(postid ,uid, contentText, mediaFolderPath);
    res.status(201).json({ message: "Feed created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit a feed
exports.editFeed = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;
    const { contentText } = req.body;

    // Cek apakah feed ada dan apakah pengguna yang membuat feed tersebut
    const existingFeed = await feedModel.getFeedDetails(postid);
    if (!existingFeed || existingFeed.uid !== uid) {
      return res.status(404).json({ error: "Feed not found or unauthorized" });
    }

    // Jika ada file baru yang diupload, upload media
    let mediaFolderPath = existingFeed.content_image; // Menyimpan path lama jika tidak ada file baru
    if (req.files && req.files.length > 0) {
      mediaFolderPath = await uploadFeedMedia(req.files, uid, postid);
    }

    // Update feed di database
    await feedModel.updateFeed(postid, uid, contentText, mediaFolderPath);
    res.status(200).json({ message: "Feed updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};




// Delete a feed
exports.deleteFeed = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;

    // Delete the entire media folder
    await deleteFeedMedia(uid, postid);

    // Delete feed from database
    await feedModel.deleteFeed(postid, uid);
    res.status(200).json({ message: "Feed deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get feed details
exports.getFeedDetails = async (req, res) => {
  try {
    const { postid } = req.params;
    const feed = await feedModel.getFeedDetails(postid);
    res.status(200).json({ feed });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
