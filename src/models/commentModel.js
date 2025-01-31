const db = require("../config/db");

// Cek apakah komentar ada berdasarkan ID
exports.getCommentById = (commentid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM tb_comments WHERE commentid = ?";
    db.query(query, [commentid], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};

// Menambahkan komentar ke postingan
exports.addComment = (uid, postid, content) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO tb_comments (commentid, uid, postid, content, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())";
    db.query(query, [uid, postid, content], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Menambahkan balasan komentar
exports.addReply = (uid, parent_commentid, content) => {
  return new Promise((resolve, reject) => {
    // Ambil postid dari komentar induk
    const getPostIdQuery = "SELECT postid FROM tb_comments WHERE commentid = ?";
    db.query(getPostIdQuery, [parent_commentid], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Parent comment not found"));

      const postid = results[0].postid;

      // Simpan balasan dengan postid yang benar
      const insertQuery = "INSERT INTO tb_comments (commentid, uid, postid, parent_commentid, content, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())";
      db.query(insertQuery, [uid, postid, parent_commentid, content], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  });
};

// Mengedit komentar
exports.editComment = (commentid, content) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE tb_comments SET content = ?, updated_at = NOW() WHERE commentid = ?";
    db.query(query, [content, commentid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Menghapus komentar
exports.deleteComment = (commentid) => {
  return new Promise((resolve, reject) => {
    const deleteRepliesQuery = "DELETE FROM tb_comments WHERE parent_commentid = ?";
    const deleteCommentQuery = "DELETE FROM tb_comments WHERE commentid = ?";

    // Hapus balasan terlebih dahulu
    db.query(deleteRepliesQuery, [commentid], (err) => {
      if (err) return reject(err);

      // Hapus komentar utama setelah balasan dihapus
      db.query(deleteCommentQuery, [commentid], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  });
};
