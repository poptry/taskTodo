const sqlite3 = require("sqlite3").verbose();
const { log } = require("console");
const path = require("path");

let db;
// 初始化数据库
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(path.join(__dirname, "hbtodo.db"), (err) => {
      if (err) {
        console.error("Could not open database:", err.message);
        reject(err);
      } else {
        console.log("Connected to the SQLite database.");
        // 创建表或执行其他数据库操作
        db.run(
          `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE);`,
          (err) => {
            if (err) {
              console.error("Could not create table:", err.message);
            }
          }
        );
        resolve();
      }
    });
    console.log("数据库初始化");
  });
}

function getDatabase() {
  return db;
}
// 导出初始化函数
module.exports = {
  initDatabase,
  getDatabase,
};
