const fs = require("fs").promises;
const path = require("path");

/**
 * Hapus semua media user di folder `uploads/:uid/`
 * @param {string} uid - UID user
 */
const deleteUserMedia = async (uid) => {
  const userUploadDir = path.join(__dirname, "../../upload", uid);

  try {
    await fs.rm(userUploadDir, { recursive: true, force: true });
    console.log(`Deleted directory: ${userUploadDir}`);
  } catch (err) {
    console.warn(`Failed to delete media: ${err.message}`);
  }
};

module.exports = { deleteUserMedia };
