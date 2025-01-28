const authService = require("../services/authService");

// Register user
exports.register = async (req, res) => {
  try {
    const { uid, email, password, fullname } = req.body;
    const token = await authService.register(uid, email, password, fullname);
    res.status(201).json({
      message: "User registered successfully!",
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email_or_uid, password } = req.body;
    const token = await authService.login(email_or_uid, password);
    res.status(200).json({
      message: "Login successful!",
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
