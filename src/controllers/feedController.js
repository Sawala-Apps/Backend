const { v4: uuidv4 } = require("uuid");
const feedModel = require("../models/feedModel");
const { uploadFeedMedia, deleteFeedMedia } = require("../utils/feedUpload");

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
    await feedModel.createFeed(postid, uid, contentText, mediaFolderPath);
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

    if (!uid) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    // Cek apakah feed ada
    const postExists = await feedModel.checkPostExists(postid);
    if (!postExists) {
      return res.status(404).json({ error: "The post does not exist or may have been deleted" });
    }

    // Cek apakah pengguna adalah pemilik feed
    const existingFeed = await feedModel.getFeedDetails(postid, uid);
    if (existingFeed.uid !== uid) {
      return res.status(403).json({ error: "Unauthorized to edit this feed" });
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
    console.error(err); // Debugging
    res.status(400).json({ error: err.message });
  }
};

// Delete a feed
exports.deleteFeed = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;

    // Cek apakah feed ada
    const postExists = await feedModel.checkPostExists(postid);
    if (!postExists) {
      return res.status(404).json({ error: "The post does not exist or may have been deleted" });
    }

    // Cek apakah pengguna adalah pemilik feed
    const existingFeed = await feedModel.getFeedDetails(postid, uid);
    if (existingFeed.uid !== uid) {
      return res.status(403).json({ error: "Unauthorized to delete this feed" });
    }

    // Delete the entire media folder
    await deleteFeedMedia(uid, postid);

    // Delete feed from database
    await feedModel.deleteFeed(postid, uid);
    res.status(200).json({ message: "Feed deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Feed Detail with comments
exports.getFeedDetails = async (req, res) => {
  try {
    const { postid } = req.params;
    const { uid } = req.user;

    if (!postid || !uid) {
      throw new Error('Missing required parameters');
    }

    const feed = await feedModel.getFeedDetails(postid, uid);
    res.status(200).json(feed);
  } catch (err) {
    // Memeriksa apakah error berasal dari 'Feed not found'
    if (err.message === 'Feed not found') {
      return res.status(404).json({ error: 'The post does not exist or may have been deleted' });
    }
    res.status(404).json({ error: err.message });
  }
};