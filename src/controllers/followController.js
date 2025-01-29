const followModel = require("../models/followModel");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerUid = req.user.uid; // User yang melakukan follow
    const followedUid = req.params.uid; // User yang akan di-follow

    if (!followerUid || !followedUid) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    if (followerUid === followedUid) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    // Cek apakah sudah follow sebelumnya
    const isFollowing = await followModel.checkFollowing(followerUid, followedUid);
    if (isFollowing) {
      return res.status(400).json({ error: "You are already following this user." });
    }

    // Tambahkan follow
    await followModel.addFollow(followerUid, followedUid);
    return res.status(201).json({ message: "User followed successfully." });
  } catch (err) {
    console.error("Error in followUser:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followerUid = req.user.uid; // User yang melakukan unfollow
    const followedUid = req.params.uid; // User yang akan di-unfollow

    if (!followerUid || !followedUid) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    if (followerUid === followedUid) {
      return res.status(400).json({ error: "You cannot unfollow yourself." });
    }

    // Cek apakah user sudah follow
    const isFollowing = await followModel.checkFollowing(followerUid, followedUid);
    if (!isFollowing) {
      return res.status(400).json({ error: "You are not following this user." });
    }

    // Hapus follow dari database
    await followModel.removeFollow(followerUid, followedUid);
    return res.status(200).json({ message: "User unfollowed successfully." });
  } catch (err) {
    console.error("Error in unfollowUser:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};
