const ftp = require("basic-ftp");
require("dotenv").config();

/**
 * Membuat koneksi ke FTP server.
 * @returns {Promise<ftp.Client>}
 */
const connectFTP = async () => {
  const client = new ftp.Client();
  client.ftp.verbose = false; // Set true untuk debug

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: process.env.FTP_PORT || 21,
      secure: process.env.FTP_SECURE === "true",
    });
    return client;
  } catch (err) {
    console.error("FTP Connection Error:", err);
    throw new Error("Failed to connect to FTP server");
  }
};

module.exports = connectFTP;
