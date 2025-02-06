const path = require("path");
const fs = require("fs");
const connectFTP = require("../config/ftp"); // Import koneksi FTP
require("dotenv").config();

/**
 * Upload satu file ke FTP
 * @param {Object} file - File yang diunggah dari Multer
 * @param {string} uid - User ID
 * @param {string} postid - Post ID
 * @returns {Promise<string>} - URL file yang tersimpan di FTP
 */
const uploadFeedMedia = async (file, uid, postid) => {
  if (!file) return null;

  const ext = path.extname(file.originalname);
  const filename = `${postid}${ext}`;
  const remotePath = `/${uid}/feed/${filename}`;

  const client = await connectFTP();
  try {
    // Buat direktori jika belum ada
    await client.ensureDir(path.dirname(remotePath));

    // Upload file ke FTP
    await client.uploadFrom(file.path, remotePath);

    // Hapus file lokal setelah diupload
    fs.unlinkSync(file.path);

    // Kembalikan URL yang bisa diakses publik
    return `https://${process.env.FTP_PUBLIC_URL}/${uid}/feed/${filename}`;
  } catch (err) {
    console.error("FTP Upload Error:", err);
    throw new Error("Failed to upload file to FTP");
  } finally {
    client.close();
  }
};

/**
 * Hapus file dari FTP
 * @param {string} uid - User ID
 * @param {string} postid - Post ID
 */
const deleteFeedMedia = async (uid, postid) => {
  const client = await connectFTP();
  try {
    const remoteDir = `/${uid}/feed/`;
    
    // Cari file dengan nama sesuai postid
    const fileList = await client.list(remoteDir);
    for (const file of fileList) {
      if (file.name.startsWith(postid)) {
        await client.remove(`${remoteDir}${file.name}`);
      }
    }
  } catch (err) {
    console.error("FTP Delete Error:", err);
  } finally {
    client.close();
  }
};

module.exports = {
  uploadFeedMedia,
  deleteFeedMedia,
};
