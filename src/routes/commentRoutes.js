const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware"); // Jika menggunakan middleware auth

// Menambahkan komentar pada postingan
router.post("/feed/:postid/comment", authMiddleware, commentController.addComment);
// Menambahkan balasan komentar
router.post("/feed/comment/:commentid/reply", authMiddleware, commentController.addReply);
// Mengedit komentar
router.patch("/feed/comment/:commentid", authMiddleware, commentController.editComment);
// Menghapus komentar
router.delete("/feed/comment/:commentid", authMiddleware, commentController.deleteComment);

module.exports = router;
