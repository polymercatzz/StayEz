const { use } = require("../routes/userRoute");
const db = require("../server/database");
const bcrypt = require("bcrypt");
require('dotenv').config();

// Register user
const registerUser = async (req, res) => {
    const { firstname, lastname, tel, email, password, confirmPassword } = req.body;

    //alert เดี๋ยวมาทำต่อ
    // if (!firstname || !password) {
    //     return res.status(400).json({ message: "Username and password are required" });
    // }

    try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert to db
        const sql = `INSERT INTO users (first_name, last_name, tel, email, password) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [firstname, lastname, tel, email, hashedPassword], function (err) {
            if (err) {
                return res.status(500).json({ message: "Error registering user", error: err.message });
            }
            res.redirect("/user/main");
        });
    } catch (error) {
        res.status(500).json({ message: "Error hashing password", error: error.message });
    }
};

// Login user
const loginUser = (req, res) => {
    const { email, password } = req.body;

    
    // Retrieve user from the database
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Set a cookie with user ID (Expires 1 hour)
        res.cookie("userId", user.user_id, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ message: "Login Successful"});
    });
};

//render main-user
const showMain = (req, res) => {
    if (req.cookies.userId == process.env.ADMIN_ID) {
        return res.redirect("/admin/main");
    }
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    const roomSql = `SELECT * FROM Room WHERE room_status = "available" ORDER BY department_id`;
    const deptSql = `SELECT * FROM Departments`;
    
    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        db.all(roomSql, (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.all(deptSql, (err, deptData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                res.render('main-user', { user: userData, room: roomData, dept: deptData});
            });
        });
    });
};

const showFav = (req, res) => {
    const favSql = `
        SELECT *
        FROM Favorites f
        JOIN room r ON f.room_id = r.room_id
        WHERE user_id = ?;
    `;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;

    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(favSql, [req.cookies.userId], (err, favData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            // check favorite Data
            // console.log(favData);
            res.render('wish-list', { fav: favData, user: userData});
        });
    });
}

const showDetails = (req, res) => {
    const room_id = req.params.room_id;

    const roomSql = `SELECT * FROM Room WHERE room_id = ?`;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.get(roomSql, [room_id], (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.render('description', { room : roomData, user: userData})
        });
    });
};

//exports
module.exports = { registerUser, loginUser, showMain, showFav, showDetails };
