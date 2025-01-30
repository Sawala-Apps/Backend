const commentModel = require("../models/commentModel");

// Menambahkan komentar pada postingan
exports.addComment = async (req, res) => {
  try {
    const { uid } = req.user;
    const { postid } = req.params;
    const { content } = req.body;

    // Tambahkan komentar ke database
    await commentModel.addComment(uid, postid, content);
    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Menambahkan balasan komentar
exports.addReply = async (req, res) => {
  try {
    const { uid } = req.user;
    const { commentid } = req.params;
    const { content } = req.body;

    // Tambahkan balasan komentar ke database
    await commentModel.addReply(uid, commentid, content);
    res.status(201).json({ message: "Reply added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mengedit komentar
exports.editComment = async (req, res) => {
  try {
    const { commentid } = req.params;
    const { content } = req.body;

    // Update komentar di database
    await commentModel.editComment(commentid, content);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Menghapus komentar
exports.deleteComment = async (req, res) => {
  try {
    const { commentid } = req.params;

    // Hapus komentar dari database
    await commentModel.deleteComment(commentid);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
