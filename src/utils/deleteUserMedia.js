const ftp = require("basic-ftp");
const connectFTP = require("../config/ftp");

/**
 * Hapus semua media user di folder `/uid/` di FTP
 * @param {string} uid - UID user
 */
const deleteUserMedia = async (uid) => {
  const client = await connectFTP();
  const remoteDir = `/${uid}/`;

  try {
    // Pastikan direktori ada dan ambil daftar file di dalamnya
    const fileList = await client.list(remoteDir);

    if (fileList.length === 0) {
      console.log(`No media found for user: ${uid}`);
    } else {
      // Hapus setiap file di dalam direktori
      for (const file of fileList) {
        const filePath = `${remoteDir}${file.name}`;

        try {
          if (file.type === 1) {
            // Hapus file
            await client.remove(filePath);
            console.log(`Deleted file: ${filePath}`);
          } else if (file.type === 2) {
            // Hapus folder (rekursif)
            await client.removeDir(filePath);
            console.log(`Deleted folder: ${filePath}`);
          }
        } catch (fileErr) {
          console.warn(`Failed to delete ${filePath}: ${fileErr.message}`);
        }
      }
    }

    // Hapus folder user jika sudah kosong
    await client.removeDir(remoteDir);
    console.log(`Deleted user folder: ${remoteDir}`);

  } catch (err) {
    console.warn(`Failed to delete media for user ${uid}: ${err.message}`);
  } finally {
    client.close();
  }
};

module.exports = { deleteUserMedia };
