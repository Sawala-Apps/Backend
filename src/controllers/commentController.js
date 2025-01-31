const commentModel = require("../models/commentModel");
const feedModel = require("../models/feedModel"); // Untuk validasi postid

// Menambahkan komentar pada postingan
exports.addComment = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // Cek apakah postid valid
    const postExists = await feedModel.checkPostExists(postid);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    await commentModel.addComment(uid, postid, content);
    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("Error in addComment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Menambahkan balasan komentar
exports.addReply = async (req, res) => {
  try {
    const { uid } = req.user;
    const { commentid } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // Cek apakah komentar induk ada
    const parentComment = await commentModel.getCommentById(commentid);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    await commentModel.addReply(uid, commentid, content);
    res.status(201).json({ message: "Reply added successfully" });
  } catch (err) {
    console.error("Error in addReply:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mengedit komentar
exports.editComment = async (req, res) => {
  try {
    const { commentid } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    // Cek apakah komentar ada
    const commentExists = await commentModel.getCommentById(commentid);
    if (!commentExists) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await commentModel.editComment(commentid, content);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    console.error("Error in editComment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Menghapus komentar
exports.deleteComment = async (req, res) => {
  try {
    const { commentid } = req.params;

    // Cek apakah komentar ada
    const commentExists = await commentModel.getCommentById(commentid);
    if (!commentExists) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await commentModel.deleteComment(commentid);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error in deleteComment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
