const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error opening the database:', err);
  } else {
    console.log('Database connection opened');
  }
});

db.serialize(() => {
  // ตาราง Users
  db.run(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          tel TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          user_status TEXT CHECK(user_status IN ('active', 'inactive')) NOT NULL DEFAULT 'active'
        )
      `);
  // ตาราง Departments
  db.run(`
        CREATE TABLE IF NOT EXISTS Departments (
          department_id INTEGER PRIMARY KEY AUTOINCREMENT,
          department_name TEXT NOT NULL
        )
      `);
  // ตาราง Room
  db.run(`
        CREATE TABLE IF NOT EXISTS Room (
          room_id INTEGER PRIMARY KEY AUTOINCREMENT,
          department_id INTEGER NOT NULL,
          room_name TEXT NOT NULL,
          size REAL,
          price REAL NOT NULL,
          p_electric REAL,
          p_water REAL,
          deposit REAL,
          pay_advance REAL,
          bedroom INTEGER,
          detail TEXT,
          room_have TEXT,
          map TEXT,
          room_status TEXT CHECK(room_status IN ('available', 'occupied')) NOT NULL DEFAULT 'available',
          FOREIGN KEY (department_id) REFERENCES Departments (department_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Room Images
  db.run(`
        CREATE TABLE IF NOT EXISTS Room_Images (
          room_img_id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          data BLOB,
          FOREIGN KEY (room_id) REFERENCES Room (room_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Favorites
  db.run(`
        CREATE TABLE IF NOT EXISTS Favorites (
          user_id INTEGER NOT NULL,
          room_id INTEGER NOT NULL,
          PRIMARY KEY (user_id, room_id),
          FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
          FOREIGN KEY (room_id) REFERENCES Room (room_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Contract
  db.run(`
        CREATE TABLE IF NOT EXISTS Contract (
          contract_id INTEGER PRIMARY KEY AUTOINCREMENT,
          prefix TEXT,
          id_card TEXT NOT NULL,
          address TEXT NOT NULL,
          bank_name TEXT NOT NULL,
          ac_name TEXT NOT NULL,
          ac_number TEXT NOT NULL,
          tenancy INTEGER NOT NULL,
          people INTEGER NOT NULL
        )
      `);

  // ตาราง History
  db.run(`
        CREATE TABLE IF NOT EXISTS History (
          history_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          room_id INTEGER NOT NULL,
          contract_id INTEGER NOT NULL,
          history_status TEXT CHECK(history_status IN ('verification', 'completed', 'cancelled')) NOT NULL DEFAULT 'verification',
          history_date DATE NOT NULL,
          FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
          FOREIGN KEY (room_id) REFERENCES Room (room_id) ON DELETE CASCADE,
          FOREIGN KEY (contract_id) REFERENCES Contract (contract_id) ON DELETE CASCADE
        )
      `);

  // ตาราง History Images
  db.run(`
        CREATE TABLE IF NOT EXISTS History_Images (
          his_img_id INTEGER PRIMARY KEY AUTOINCREMENT,
          history_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          data BLOB,
          FOREIGN KEY (history_id) REFERENCES History (history_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Payment
  db.run(`
        CREATE TABLE IF NOT EXISTS Payment (
          payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
          history_id INTEGER NOT NULL,
          r_electric REAL,
          r_water REAL,
          r_other REAL,
          payment_date DATE NOT NULL,
          payment_status TEXT CHECK(payment_status IN ('Pending', 'Review', 'Completed')) NOT NULL DEFAULT 'Pending',
          FOREIGN KEY (history_id) REFERENCES History (history_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Payment Images
  db.run(`
        CREATE TABLE IF NOT EXISTS Payment_Images (
          pay_img_id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          data BLOB NOT NULL,
          FOREIGN KEY (payment_id) REFERENCES Payment (payment_id) ON DELETE CASCADE
        )
      `);

  // ตาราง Report
  db.run(`
        CREATE TABLE IF NOT EXISTS "Report" (
          report_id	INTEGER,
          rent REAL NOT NULL,
          water_income REAL NOT NULL,
          electric_income REAL NOT NULL,
          other_income REAL NOT NULL,
          water_bill	REAL NOT NULL,
          electric_bill	REAL NOT NULL,
          other_bill	REAL NOT NULL,
          total_amount	REAL NOT NULL,
          date	DATE NOT NULL,
          PRIMARY KEY("report_id" AUTOINCREMENT)
        );`
      );

  // ตาราง Review
  db.run(`
      CREATE TABLE IF NOT EXISTS Review (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        FOREIGN KEY (user_id) REFERENCES Users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES Room (room_id) ON DELETE CASCADE
      )
      `);
}
);


module.exports = db;
