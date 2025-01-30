const db = require("../config/db");

// Cek apakah user sudah like postingan ini
exports.checkUserLike = (uid, postid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT likeid FROM tb_likes WHERE uid = ? AND postid = ?";
    db.query(query, [uid, postid], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

// Tambahkan like ke database
exports.addLike = (uid, postid) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO tb_likes (likeid, uid, postid, created_at) VALUES (UUID(), ?, ?, NOW())";
    db.query(query, [uid, postid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Hapus like dari database
exports.removeLike = (uid, postid) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM tb_likes WHERE uid = ? AND postid = ?";
    db.query(query, [uid, postid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

