const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456", // Đổi thành mật khẩu MySQL của bạn nếu khác
  database: "newsdb"
});

module.exports = db;