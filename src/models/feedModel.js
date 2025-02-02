const db = require("../config/db");

// Cek apakah post dengan ID tertentu ada
exports.checkPostExists = (postid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT EXISTS(SELECT 1 FROM tb_feed WHERE postid = ?) AS is_exists"; // Mengubah alias menjadi is_exists
    db.query(query, [postid], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].is_exists === 1); // Menggunakan alias baru is_exists
    });
  });
};

//GET all feed
exports.getFeeds = async (uid) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, u.fullname, u.profile_picture,
        (SELECT COUNT(*) FROM tb_likes l WHERE l.postid = f.postid) AS like_count,
        (SELECT COUNT(*) FROM tb_views v WHERE v.postid = f.postid) AS view_count,
        (SELECT COUNT(*) FROM tb_comments c WHERE c.postid = f.postid) AS comment_count,
        EXISTS (SELECT 1 FROM tb_likes l WHERE l.postid = f.postid AND l.uid = ?) AS is_liked,
        CASE 
          WHEN fol.follower_uid IS NOT NULL THEN 1 
          ELSE 0 
        END AS is_followed
      FROM tb_feed f
      LEFT JOIN tb_follows fol ON fol.followed_uid = f.uid AND fol.follower_uid = ?
      LEFT JOIN tb_users u ON u.uid = f.uid
      ORDER BY is_followed DESC, f.created_at DESC
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
    // Cek apakah postid ada
    this.checkPostExists(postid).then(exists => {
      if (!exists) {
        return reject(new Error("The post does not exist or may have been deleted"));
      }

      const query = "DELETE FROM tb_feed WHERE postid = ? AND uid = ?";
      db.query(query, [postid, uid], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    }).catch(reject);
  });
};

// Get Feed Details with comments and replies
exports.getFeedDetails = async (postid, uid) => {
  return new Promise((resolve, reject) => {
    // Query untuk mengecek apakah postid ada di tb_feed
    const checkPostQuery = `
      SELECT 1 FROM tb_feed WHERE postid = ? LIMIT 1
    `;

    db.query(checkPostQuery, [postid], (checkErr, checkResults) => {
      if (checkErr) return reject(checkErr);

      // Jika postid tidak ditemukan di tb_feed, kembalikan error
      if (checkResults.length === 0) {
        return reject(new Error('The post does not exist or may have been deleted'));
      }

      // Jika postid ada, lanjutkan untuk mengecek view dan data feed
      const checkViewQuery = `SELECT viewid FROM tb_views WHERE postid = ? AND uid = ?`;

      db.query(checkViewQuery, [postid, uid], (err, viewResults) => {
        if (err) return reject(err);

        if (viewResults.length === 0) {
          const insertViewQuery = `
            INSERT INTO tb_views (viewid, postid, uid, created_at) 
            VALUES (UUID(), ?, ?, NOW())
          `;
          db.query(insertViewQuery, [postid, uid], (insertErr) => {
            if (insertErr) return reject(insertErr);
          });
        }

        // Query utama untuk mendapatkan feed detail
        const getFeedQuery = `
          SELECT 
            f.*,
            u.fullname,
            u.profile_picture,
            (SELECT COUNT(*) FROM tb_likes l WHERE l.postid = f.postid) AS like_count,
            (SELECT COUNT(*) FROM tb_views v WHERE v.postid = f.postid) AS view_count,
            (SELECT COUNT(*) FROM tb_comments c WHERE c.postid = f.postid) AS comment_count,
            EXISTS (SELECT 1 FROM tb_likes l WHERE l.postid = f.postid AND l.uid = ?) AS is_liked
          FROM tb_feed f
          LEFT JOIN tb_users u ON u.uid = f.uid
          WHERE f.postid = ?
          LIMIT 1
        `;

        db.query(getFeedQuery, [uid, postid], (feedErr, feedResults) => {
          if (feedErr) return reject(feedErr);

          const feedData = feedResults[0];

          // Query untuk mendapatkan komentar utama beserta balasannya
          const getCommentsQuery = `
            SELECT c.commentid, c.content, c.created_at, c.uid, u.fullname, u.profile_picture,
              (SELECT COUNT(*) FROM tb_comments r WHERE r.parent_commentid = c.commentid) AS reply_count
            FROM tb_comments c
            LEFT JOIN tb_users u ON u.uid = c.uid
            WHERE c.postid = ? AND c.parent_commentid IS NULL
            ORDER BY c.created_at ASC
          `;

          db.query(getCommentsQuery, [postid], (commentErr, commentResults) => {
            if (commentErr) return reject(commentErr);

            // Query untuk mendapatkan semua balasan dari komentar utama
            const getRepliesQuery = `
              SELECT c.commentid, c.content, c.created_at, c.uid, u.fullname, u.profile_picture, c.parent_commentid
              FROM tb_comments c
              LEFT JOIN tb_users u ON u.uid = c.uid
              WHERE c.postid = ? AND c.parent_commentid IS NOT NULL
              ORDER BY c.created_at ASC
            `;

            db.query(getRepliesQuery, [postid], (replyErr, replyResults) => {
              if (replyErr) return reject(replyErr);

              // Strukturkan data komentar dengan balasannya
              const comments = commentResults.map(comment => ({
                ...comment,
                replies: replyResults.filter(reply => reply.parent_commentid === comment.commentid)
              }));

              // Gabungkan feed dengan komentar
              resolve({ ...feedData, comments });
            });
          });
        });
      });
    });
  });
};