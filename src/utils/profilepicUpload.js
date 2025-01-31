const fs = require("fs").promises;
const path = require("path");

const allowedExtensions = [".png", ".jpg", ".jpeg"];

/**
 * Upload profile picture
 * @param {Object} file - File yang diupload dari request (req.file)
 * @param {string} uid - UID user
 * @returns {string} - Path gambar yang disimpan
 */
const uploadProfilePicture = async (file, uid) => {
  if (!file) return null;

  const uploadDir = path.join(__dirname, "../../upload", uid, "profilepic");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error("Invalid file format. Allowed: .png, .jpg, .jpeg");
  }

  const newFilename = `${uid}${ext}`;
  const newFilePath = path.join(uploadDir, newFilename);

  // Hapus file lama jika ada (gunakan try-catch untuk menangani error)
  try {
    const files = await fs.readdir(uploadDir);
    await Promise.all(files.map(file => fs.unlink(path.join(uploadDir, file))));
  } catch (err) {
    console.warn("No old profile picture found or error deleting:", err.message);
  }

  // Pindahkan file baru
  await fs.rename(file.path, newFilePath);

  return `/uploads/${uid}/profilepic/${newFilename}`;
};

module.exports = { uploadProfilePicture };
