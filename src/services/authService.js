const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// Cek apakah email atau UID sudah terdaftar
exports.checkUserExists = async (email, uid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM tb_users WHERE email = ? OR uid = ?";
    db.query(query, [email, uid], (err, results) => {
      if (err) return reject(new Error("Database query error."));
      if (results.length > 0) return resolve(true);  // Jika ditemukan, berarti sudah terdaftar
      resolve(false);  // Tidak ditemukan, berarti belum terdaftar
    });
  });
};

// Register service
exports.register = async (uid, email, password, fullname) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const query = "INSERT INTO tb_users (uid, email, password, fullname) VALUES (?, ?, ?, ?)";
      db.query(query, [uid, email, hashedPassword, fullname], (err) => {
        if (err) return reject(new Error("Failed to register user."));
        const token = generateToken({ uid, email });
        resolve(token);
      });
    });
  } catch (err) {
    throw new Error("Error in registration process.");
  }
};


// Login service
exports.login = async (email_or_uid, password) => {
  try {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM tb_users WHERE email = ? OR uid = ? LIMIT 1";
      db.query(query, [email_or_uid, email_or_uid], async (err, results) => {
        if (err) return reject(new Error("Database query error."));
        if (results.length === 0) return reject(new Error("User not found!"));

        const user = results[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return reject(new Error("Invalid credentials!"));

        const token = generateToken({ uid: user.uid, email: user.email });
        resolve(token);
      });
    });
  } catch (err) {
    throw new Error("Error in login process.");
  }
};