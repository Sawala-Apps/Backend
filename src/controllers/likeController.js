const likeModel = require("../models/likeModel");

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;

    // Cek apakah user sudah like postingan ini
    const alreadyLiked = await likeModel.checkUserLike(uid, postid);
    if (alreadyLiked) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    // Simpan like ke database
    await likeModel.addLike(uid, postid);
    res.status(201).json({ message: "Post liked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;

    // Cek apakah user sudah like postingan ini
    const alreadyLiked = await likeModel.checkUserLike(uid, postid);
    if (!alreadyLiked) {
      return res.status(400).json({ message: "You haven't liked this post yet" });
    }

    // Hapus like dari database
    await likeModel.removeLike(uid, postid);
    res.status(200).json({ message: "Post unliked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
