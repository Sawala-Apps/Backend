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

    // Upload file jika ada
    const mediaUrl = req.file ? await uploadFeedMedia(req.file, uid, postid) : null;

    // Simpan feed ke database
    await feedModel.createFeed(postid, uid, contentText, mediaUrl);
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

    // Cek apakah feed ada dan milik user
    const existingFeed = await feedModel.getFeedDetails(postid, uid);
    if (!existingFeed) {
      return res.status(404).json({ error: "The post does not exist or may have been deleted" });
    }
    if (existingFeed.uid !== uid) {
      return res.status(403).json({ error: "Unauthorized to edit this feed" });
    }

    let mediaUrl = existingFeed.content_image;

    // Jika ada file baru yang diupload, hapus file lama & upload yang baru
    if (req.file) {
      if (existingFeed.content_image) {
        await deleteFeedMedia(uid, postid);
      }
      mediaUrl = await uploadFeedMedia(req.file, uid, postid);
    }

    // Update feed di database
    await feedModel.updateFeed(postid, uid, contentText, mediaUrl);
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

    // Cek apakah feed ada dan milik user
    const existingFeed = await feedModel.getFeedDetails(postid, uid);
    if (!existingFeed) {
      return res.status(404).json({ error: "The post does not exist or may have been deleted" });
    }
    if (existingFeed.uid !== uid) {
      return res.status(403).json({ error: "Unauthorized to delete this feed" });
    }

    // Hapus file media dari FTP jika ada
    if (existingFeed.content_image) {
      await deleteFeedMedia(uid, postid);
    }

    // Hapus feed dari database
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
      throw new Error("Missing required parameters");
    }

    const feed = await feedModel.getFeedDetails(postid, uid);
    if (!feed) {
      return res.status(404).json({ error: "The post does not exist or may have been deleted" });
    }

    res.status(200).json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
