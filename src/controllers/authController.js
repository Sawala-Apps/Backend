const authService = require("../services/authService");

// Register user
exports.register = async (req, res) => {
  try {
    const { uid, email, password, fullname } = req.body;
    
    if (!uid || !email || !password || !fullname) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    // Validasi password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be 6-12 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character." });
    }

    // Validasi apakah email atau UID sudah terdaftar
    const userExists = await authService.checkUserExists(email, uid);
    if (userExists) {
      return res.status(400).json({ error: "Email or UID is already taken." });
    }

    const token = await authService.register(uid, email, password, fullname);
    res.status(201).json({
      message: "User registered successfully!",
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email_or_uid, password } = req.body;

    if (!email_or_uid || !password) {
      return res.status(400).json({ error: "Email/UID and password are required!" });
    }

    const token = await authService.login(email_or_uid, password);
    res.status(200).json({
      message: "Login successful!",
      token,
    });
  } catch (err) {
    res.status(401).json({ error: err.message || "Invalid login credentials." });
  }
};
