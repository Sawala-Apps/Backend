const db = require("../config/db");

// Get all feeds with filtering algorithm
exports.getFeeds = async (uid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, u.fullname, u.profile_picture
      FROM tb_feed f
      LEFT JOIN tb_follows fol ON fol.follower_uid = ?
      LEFT JOIN tb_users u ON u.uid = f.uid
      WHERE (fol.followed_uid = f.uid OR f.uid = ?) -- Prioritizing followed users
      ORDER BY f.created_at DESC -- Newest first
    `;
    db.query(query, [uid, uid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Create a feed
exports.createFeed = async (postid, uid, contentText, contentImage) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO tb_feed (postid, uid, content_text, content_image) VALUES (?, ?, ?, ?)";
    db.query(query, [postid ,uid, contentText, contentImage], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Update a feed
exports.updateFeed = async (postid, uid, contentText, contentImage) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE tb_feed SET content_text = ?, content_image = ? WHERE postid = ? AND uid = ?";
    db.query(query, [contentText, contentImage, postid, uid], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Delete a feed
exports.deleteFeed = async (postid, uid) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM tb_feed WHERE postid = ? AND uid = ?";
    db.query(query, [postid, uid], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Get feed details
exports.getFeedDetails = async (postid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, u.fullname, u.profile_picture
      FROM tb_feed f
      LEFT JOIN tb_users u ON u.uid = f.uid
      WHERE f.postid = ?
    `;
    db.query(query, [postid], (err, results) => {
      if (err || results.length === 0) return reject("Feed not found");
      resolve(results[0]);
    });
  });
};
