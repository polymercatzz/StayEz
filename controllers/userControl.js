const db = require("../server/database");
const bcrypt = require("bcrypt");

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
            res.redirect("/main");
        });
    } catch (error) {
        res.status(500).json({ message: "Error hashing password", error: error.message });
    }
};

// Login user
const loginUser = (req, res) => {
    const { email, password } = req.body;

    //alert เดี๋ยวมาทำต่อ
    // if (!email || !password) {
    //     return res.status(400).json({ message: "email and password are required" });
    // }

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

//get info
const getUserProfile = (req, res) => {
    // Read user ID from cookies
    const userId = req.cookies.userId;

    const sql = `SELECT firstname, lastname, tel, email FROM users WHERE user_id = ?`;
    db.get(sql, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.send(user);
    });
};

//exports
module.exports = { registerUser, loginUser, getUserProfile };
