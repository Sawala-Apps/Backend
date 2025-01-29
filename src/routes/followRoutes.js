const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/follow/:uid", authMiddleware, followController.followUser);
router.delete("/follow/:uid", authMiddleware, followController.unfollowUser);


module.exports = router;
