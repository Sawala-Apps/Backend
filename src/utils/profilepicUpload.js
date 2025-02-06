const ftp = require("basic-ftp");
const path = require("path");
const connectFTP = require("../config/ftp");

const allowedExtensions = [".png", ".jpg", ".jpeg"];

/**
 * Upload profile picture ke FTP
 * @param {Object} file - File yang diupload dari request (req.file)
 * @param {string} uid - UID user
 * @returns {string} - URL gambar yang tersimpan
 */
const uploadProfilePicture = async (file, uid) => {
  if (!file) return null;

  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error("Invalid file format. Allowed: .png, .jpg, .jpeg");
  }

  const filename = `${uid}${ext}`;
  const remoteDir = `/${uid}/profilepic/`;
  const remotePath = `${remoteDir}${filename}`;

  const client = await connectFTP();
  try {
    // Pastikan direktori di FTP tersedia
    await client.ensureDir(remoteDir);

    // Hapus file lama jika ada
    const fileList = await client.list(remoteDir);
    for (const file of fileList) {
      await client.remove(`${remoteDir}${file.name}`);
    }

    // Upload file baru
    await client.uploadFrom(file.path, remotePath);

    // Kembalikan URL yang bisa diakses publik
    return `https://nova-agustina.my.id/22cns/FadhlanHafidz/Sawala${remotePath}`;
  } catch (err) {
    console.error("FTP Upload Error:", err);
    throw new Error("Failed to upload profile picture to FTP");
  } finally {
    client.close();
  }
};

module.exports = { uploadProfilePicture };
