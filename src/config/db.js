const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Buat koneksi ke database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

// Tes koneksi ke database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // Keluar jika koneksi gagal
  }
  console.log("Database connected successfully!");
});

module.exports = db;