const profileModel = require("../models/profileModel");
const followModel = require("../models/followModel");
const { uploadProfilePicture } = require("../utils/profilePicUpload");
const { deleteUserMedia } = require("../utils/deleteUserMedia");

// Get User Profile + Postingan
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await profileModel.getUserProfile(uid);
    const followStats = await followModel.getUserFollowStats(uid);

    // Modifikasi path gambar agar bisa diakses via URL
    if (user.profile_picture) {
      user.profile_picture = `${req.protocol}://${req.get("host")}/uploads/${uid}/profilepic/${uid}`;
    }

    // Gabungkan hasil
    user.followers = followStats.followers;
    user.following = followStats.following;

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err });
  }
};

// Update Profile (Fullname & Profile Picture)
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { fullname } = req.body;
    
    // Upload gambar profil
    const profilePicturePath = req.file ? await uploadProfilePicture(req.file, uid) : null;

    // Update database
    await profileModel.updateProfile(uid, fullname, profilePicturePath);
    const updatedUser = await profileModel.getUserProfile(uid);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error in updating profile:", err);
    res.status(400).json({ error: err.message });
  }
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { uid } = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new password are required" });
    }

    await profileModel.updatePassword(uid, oldPassword, newPassword);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message || "Internal Server Error" });
  }
};


// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const { uid } = req.user;
    deleteUserMedia(uid);
    await profileModel.deleteAccount(uid);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
