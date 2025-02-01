const fs = require("fs");
const path = require("path");

/**
 * Upload feed media files to a specific directory
 * @param {Array} files - Array of uploaded files (from Multer)
 * @param {string} uid - User ID
 * @param {string} postid - Post ID
 * @returns {Promise<Array>} - Array of file URLs
 */
const uploadFeedMedia = async (files, uid, postid) => {
  if (!files || files.length === 0) return null; // Return null if no files uploaded

  const uploadPath = path.join(__dirname, "../../upload", uid, "feed");

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  let fileUrls = [];
  
  files.forEach((file, index) => {
    const ext = path.extname(file.originalname);
    const newFilename = `${postid}${index === 0 ? '' : '-' + (index + 1)}${ext}`;
    const newPath = path.join(uploadPath, newFilename);

    // Rename and move the file
    fs.renameSync(file.path, newPath);

    // Store the file URL
    fileUrls.push(`/upload/${uid}/feed/${newFilename}`);
  });

  return fileUrls;
};

/**
 * Delete all media files for a specific feed
 * @param {string} uid - User ID
 * @param {string} postid - Post ID
 */
const deleteFeedMedia = async (uid, postid) => {
  const uploadPath = path.join(__dirname, "../../upload", uid, "feed");

  if (fs.existsSync(uploadPath)) {
    fs.readdirSync(uploadPath).forEach((file) => {
      if (file.startsWith(postid)) {
        fs.unlinkSync(path.join(uploadPath, file));
      }
    });
  }
};

module.exports = {
  uploadFeedMedia,
  deleteFeedMedia,
};
