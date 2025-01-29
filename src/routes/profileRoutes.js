const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer({ dest: "temp/profilePics/" }); // Simpan sementara sebelum diproses

// Middleware untuk proteksi endpoint
router.use(authMiddleware);

// Get user profile (dengan postingan)
router.get("/profile", profileController.getUserProfile);

// Update profile (fullname & foto profil)
router.patch("/profile", upload.single("profilePicture"), profileController.updateProfile);

// Update password
router.patch("/profile/password", profileController.updatePassword);

// Delete account
router.delete("/profile", profileController.deleteAccount);

module.exports = router;
