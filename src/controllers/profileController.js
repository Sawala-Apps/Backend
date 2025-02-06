const profileModel = require("../models/profileModel");
const followModel = require("../models/followModel");
const { uploadProfilePicture } = require("../utils/profilepicUpload");
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

// Get Other User Profile (tanpa data sensitif)
exports.getOtherUserProfile = async (req, res) => {
  try {
    const requesterUid = req.user.uid; // User yang melihat profil
    const targetUid = req.params.uid; // User yang ingin dilihat

    const user = await profileModel.getOtherUserProfile(requesterUid, targetUid);
    const followStats = await followModel.getUserFollowStats(targetUid);

    // Modifikasi path gambar agar bisa diakses via URL
    if (user.profile_picture) {
      user.profile_picture = `${req.protocol}://${req.get("host")}/uploads/${targetUid}/profilepic/${targetUid}`;
    }

    // Tambahkan jumlah followers & following
    user.followers = followStats.followers;
    user.following = followStats.following;

    // Mengembalikan response dengan status follow
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};



// Update Profile (Fullname & Profile Picture)
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { fullname } = req.body;

    let profilePicturePath = null;
    if (req.file) {
      try {
        profilePicturePath = await uploadProfilePicture(req.file, uid);
      } catch (uploadErr) {
        return res.status(400).json({ error: "Failed to upload profile picture" });
      }
    }

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

    // Validasi password baru
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: "Password must be 6-12 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }

    // Melakukan update password
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

    // Cek apakah user ada sebelum menghapus
    const userExists = await profileModel.getUserProfile(uid);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    deleteUserMedia(uid);
    await profileModel.deleteAccount(uid);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
