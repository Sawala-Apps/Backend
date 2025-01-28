const jwt = require("jsonwebtoken");

// Middleware untuk memverifikasi token JWT
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Gunakan secret dari .env
    req.user = decoded; // Simpan payload token ke request object
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
