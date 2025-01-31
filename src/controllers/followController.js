const followModel = require("../models/followModel");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerUid = req.user.uid;
    const followedUid = req.params.uid;

    if (!followerUid || !followedUid) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }

    if (followerUid === followedUid) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    const isFollowing = await followModel.checkFollowing(followerUid, followedUid);
    if (isFollowing) {
      return res.status(400).json({ error: "You are already following this user." });
    }

    await followModel.addFollow(followerUid, followedUid);
    return res.status(201).json({ message: "User followed successfully." });
  } catch (err) {
    console.error("Error in followUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followerUid = req.user.uid;
    const followedUid = req.params.uid;

    if (!followerUid || !followedUid) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }

    if (followerUid === followedUid) {
      return res.status(400).json({ error: "You cannot unfollow yourself." });
    }

    const isFollowing = await followModel.checkFollowing(followerUid, followedUid);
    if (!isFollowing) {
      return res.status(400).json({ error: "You are not following this user." });
    }

    const unfollowed = await followModel.removeFollow(followerUid, followedUid);
    if (!unfollowed) {
      return res.status(400).json({ error: "Follow relationship not found." });
    }

    return res.status(200).json({ message: "User unfollowed successfully." });
  } catch (err) {
    console.error("Error in unfollowUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
