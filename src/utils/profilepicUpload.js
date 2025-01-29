const fs = require("fs");
const path = require("path");

/**
 * Upload profile picture
 * @param {Object} file - File yang diupload dari request (req.file)
 * @param {string} uid - UID user
 * @returns {string} - Path gambar yang disimpan
 */
const uploadProfilePicture = async (file, uid) => {
  if (!file) return null; // Tidak ada file yang diupload

  const uploadDir = path.join(__dirname, "../../upload", uid, "profilepic");

  // Pastikan folder ada
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Ambil ekstensi file
  const ext = path.extname(file.originalname);
  const newFilename = `${uid}${ext}`;
  const newFilePath = path.join(uploadDir, newFilename);

  // Hapus file lama jika ada
  fs.readdirSync(uploadDir).forEach((existingFile) => {
    const existingFilePath = path.join(uploadDir, existingFile);
    fs.unlinkSync(existingFilePath); // Hapus file lama
  });

  // Pindahkan file baru ke direktori yang benar
  fs.renameSync(file.path, newFilePath);

  return `/uploads/${uid}/profilepic/${newFilename}`;
};

module.exports = { uploadProfilePicture };
