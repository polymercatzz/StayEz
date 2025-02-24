const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error opening the database:', err);
    } else {
      console.log('Database connection opened');
    }
  });

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT NOT NULL UNIQUE,
            lastname TEXT NOT NULL,
            tel TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            address TEXT,
            status TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("Users table is ready.");
            }
        }
    )});

module.exports = db;
