const mysql = require("mysql2"); // Ganti dari mysql ke mysql2
const dotenv = require("dotenv");

dotenv.config();

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PORT:", process.env.DB_PORT);

// Buat koneksi ke database dengan port
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Tambahkan port di sini
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