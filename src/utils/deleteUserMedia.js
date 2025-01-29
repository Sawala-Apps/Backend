const fs = require("fs");
const path = require("path");

/**
 * Hapus semua media user di folder `uploads/:uid/`
 * @param {string} uid - UID user
 */
const deleteUserMedia = (uid) => {
  const userUploadDir = path.join(__dirname, "../../upload", uid);

  if (fs.existsSync(userUploadDir)) {
    fs.rmSync(userUploadDir, { recursive: true, force: true });
    console.log(`Deleted directory: ${userUploadDir}`);
  }
};

module.exports = { deleteUserMedia };
