const db = require("../config/db");

// Cek apakah user sudah follow
exports.checkFollowing = async (followerUid, followedUid) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT EXISTS(SELECT 1 FROM tb_follows WHERE follower_uid = ? AND followed_uid = ?) AS isFollowing",
      [followerUid, followedUid],
      (err, results) => {
        if (err) {
          console.error("Error checking following status:", err);
          reject(err);
          return;
        }
        resolve(results[0].isFollowing === 1);
      }
    );
  });
};

// Tambahkan follow ke database
exports.addFollow = async (followerUid, followedUid) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tb_follows (followid, follower_uid, followed_uid, created_at) VALUES (UUID(), ?, ?, NOW())",
      [followerUid, followedUid],
      (err, result) => {
        if (err) {
          console.error("Error adding follow:", err);
          reject(err);
          return;
        }
        resolve(result);
      }
    );
  });
};

exports.removeFollow = async (followerUid, followedUid) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM tb_follows WHERE follower_uid = ? AND followed_uid = ?",
      [followerUid, followedUid],
      (err, result) => {
        if (err) {
          console.error("Error removing follow:", err);
          reject(err);
          return;
        }
        
        // Jika tidak ada baris yang dihapus, return false agar tidak menyebabkan error di controller
        resolve(result.affectedRows > 0);
      }
    );
  });
};

//Mendapatkan jumlah followers dan following
exports.getUserFollowStats = async (uid) => {
  try {
    const queryFollowers = "SELECT COUNT(*) AS followers FROM tb_follows WHERE followed_uid = ?";
    const queryFollowing = "SELECT COUNT(*) AS following FROM tb_follows WHERE follower_uid = ?";

    const followersCount = await new Promise((resolve, reject) => {
      db.query(queryFollowers, [uid], (err, results) => {
        if (err) reject(err);
        resolve(results[0].followers);
      });
    });

    const followingCount = await new Promise((resolve, reject) => {
      db.query(queryFollowing, [uid], (err, results) => {
        if (err) reject(err);
        resolve(results[0].following);
      });
    });

    return { followers: followersCount, following: followingCount };
  } catch (err) {
    console.error("Error fetching follow stats:", err);
    throw new Error("Error fetching follow stats: " + err.message);
  }
};


