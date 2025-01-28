const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// Register service
exports.register = async (uid, email, password, fullname) => {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    const query = "INSERT INTO tb_users (uid, email, password, fullname) VALUES (?, ?, ?, ?)";
    db.query(query, [uid, email, hashedPassword, fullname], (err) => {
      if (err) return reject(err);
      const token = generateToken({ uid, email });
      resolve(token);
    });
  });
};

// Login service
exports.login = async (email_or_uid, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM tb_users WHERE email = ? OR uid = ?";
    db.query(query, [email_or_uid, email_or_uid], async (err, results) => {
      if (err || results.length === 0) return reject("User not found!");
      const user = results[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return reject("Invalid credentials!");

      const token = generateToken({ uid: user.uid, email: user.email });
      resolve(token);
    });
  });
};
