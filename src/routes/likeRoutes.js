const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/feed/:postid/like", authMiddleware, likeController.likePost);
router.delete("/feed/:postid/like", authMiddleware, likeController.unlikePost);

module.exports = router;
