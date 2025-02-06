const db = require("../config/db");

// Cek apakah post dengan ID tertentu ada
exports.checkPostExists = (postid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM tb_feed WHERE postid = ?";
    db.query(query, [postid], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].count > 0);
    });
  });
};

// GET all feed
exports.getFeeds = (uid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, u.fullname, u.profile_picture,
        (SELECT COUNT(*) FROM tb_likes WHERE postid = f.postid) AS like_count,
        (SELECT COUNT(*) FROM tb_views WHERE postid = f.postid) AS view_count,
        (SELECT COUNT(*) FROM tb_comments WHERE postid = f.postid) AS comment_count
      FROM tb_feed f
      LEFT JOIN tb_users u ON u.uid = f.uid
      ORDER BY f.created_at DESC
    `;
    db.query(query, [uid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Create a feed
exports.createFeed = (postid, uid, contentText, contentImage) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO tb_feed (postid, uid, content_text, content_image) VALUES (?, ?, ?, ?)";
    db.query(query, [postid, uid, contentText, contentImage], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Update a feed
exports.updateFeed = (postid, uid, contentText, contentImage) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE tb_feed SET content_text = ?, content_image = ? WHERE postid = ? AND uid = ?";
    db.query(query, [contentText, contentImage, postid, uid], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Delete a feed
exports.deleteFeed = (postid, uid) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM tb_feed WHERE postid = ? AND uid = ?";
    db.query(query, [postid, uid], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Get Feed Details with comments
exports.getFeedDetails = (postid, uid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, u.fullname, u.profile_picture,
        (SELECT COUNT(*) FROM tb_likes WHERE postid = f.postid) AS like_count,
        (SELECT COUNT(*) FROM tb_views WHERE postid = f.postid) AS view_count,
        (SELECT COUNT(*) FROM tb_comments WHERE postid = f.postid) AS comment_count
      FROM tb_feed f
      LEFT JOIN tb_users u ON u.uid = f.uid
      WHERE f.postid = ?
    `;
    db.query(query, [postid], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};
