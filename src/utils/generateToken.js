const jwt = require("jsonwebtoken");

// Generate JWT Token securely
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret key is not defined in environment variables.");
  }

  // Filter payload untuk memastikan tidak ada data sensitif
  const { uid, email } = payload;

  return jwt.sign({ uid, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Bisa diatur di .env
    algorithm: "HS256", // Menentukan algoritma yang aman
  });
};

module.exports = generateToken;
