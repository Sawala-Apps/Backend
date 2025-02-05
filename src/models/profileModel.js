const db = require("../config/db");
const bcrypt = require("bcrypt");

// Get user profile + daftar postingan user
exports.getUserProfile = async (uid) => {
  try {
    // Pisah menjadi 2 query
    const userQuery = "SELECT uid, fullname, profile_picture FROM tb_users WHERE uid = ?";
    const postsQuery = "SELECT postid, content_text, content_image, created_at FROM tb_feed WHERE uid = ? ORDER BY created_at DESC";
    
    // Eksekusi query user
    const userData = await new Promise((resolve, reject) => {
      db.query(userQuery, [uid], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Eksekusi query posts
    const userPosts = await new Promise((resolve, reject) => {
      db.query(postsQuery, [uid], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    if (!userData || userData.length === 0) {
      throw new Error("User not found");
    }

    const userProfile = userData[0];
    userProfile.posts = userPosts || [];

    return userProfile;

  } catch (err) {
    console.error("Error fetching user profile:", err);
    throw new Error("Error fetching user profile: " + err.message);
  }
};

// Get Other User Profile (tanpa data sensitif + cek apakah user mengikuti akun ini)
exports.getOtherUserProfile = async (requesterUid, targetUid) => {
  try {
    const userQuery = `
      SELECT uid, fullname, profile_picture 
      FROM tb_users 
      WHERE uid = ?
    `;

    const checkFollowQuery = `
      SELECT COUNT(*) AS is_following 
      FROM tb_follows 
      WHERE follower_uid = ? AND followed_uid = ?
    `;

    const postsQuery = `
      SELECT postid, content_text, content_image, created_at 
      FROM tb_feed 
      WHERE uid = ? 
      ORDER BY created_at DESC
    `;

    // Ambil data user
    const userData = await new Promise((resolve, reject) => {
      db.query(userQuery, [targetUid], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject(new Error("User not found"));
        resolve(results[0]);
      });
    });

    // Cek apakah requester sudah follow user yang dilihat
    const followStatus = await new Promise((resolve, reject) => {
      db.query(checkFollowQuery, [requesterUid, targetUid], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].is_following > 0 ? 1 : 0);  // 1 jika sudah follow, 0 jika belum
      });
    });

    // Jika user melihat profil sendiri, selalu tampilkan postingan
    let userPosts = [];
    if (requesterUid === targetUid || followStatus === 1) {
      userPosts = await new Promise((resolve, reject) => {
        db.query(postsQuery, [targetUid], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }

    userData.posts = userPosts || [];
    userData.is_follow = followStatus;  // Menambahkan status follow pada userData
    return userData;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    throw new Error("Error fetching user profile: " + err.message);
  }
};




// Update profile (fullname & profile picture)
exports.updateProfile = async (uid, fullname, profilePicture) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE tb_users SET fullname = ?, profile_picture = ? WHERE uid = ?";
    db.query(query, [fullname, profilePicture, uid], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Update password
exports.updatePassword = (uid, oldPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ambil password lama dari database
      const querySelect = "SELECT password FROM tb_users WHERE uid = ?";
      db.query(querySelect, [uid], async (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return reject({ message: "User not found" });

        const hashedPassword = results[0].password;
        if (!hashedPassword) return reject({ message: "No password set for this account" });

        // Bandingkan password lama
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) return reject({ message: "Incorrect old password" });

        // Hash password baru
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        const queryUpdate = "UPDATE tb_users SET password = ? WHERE uid = ?";
        db.query(queryUpdate, [newHashedPassword, uid], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};


// Delete user account
exports.deleteAccount = async (uid) => {
  return new Promise((resolve, reject) => {
    // Cek apakah user ada
    const checkQuery = "SELECT uid FROM tb_users WHERE uid = ?";
    db.query(checkQuery, [uid], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("User not found"));

      // Jika user ada, lanjutkan penghapusan
      const deleteQuery = "DELETE FROM tb_users WHERE uid = ?";
      db.query(deleteQuery, [uid], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
};

