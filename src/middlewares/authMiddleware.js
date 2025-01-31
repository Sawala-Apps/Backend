const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.slice(7).trim(); // Hapus "Bearer " dengan aman
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // Simpan payload token di request object
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
