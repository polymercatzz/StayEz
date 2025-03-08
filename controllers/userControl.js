const { use } = require("../routes/userRoute");
const db = require("../server/database");
const bcrypt = require("bcrypt");
require('dotenv').config();

// Register user
const registerUser = async (req, res) => {
    const { register_firstname, register_lastname, register_tel, register_email, register_password, register_confirmPassword } = req.body;

    if (!register_firstname || !register_lastname || !register_tel || !register_email || !register_password || !register_confirmPassword) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (register_password !== register_confirmPassword) {
        return res.status(400).json({ message: "รหัสผ่านไม่ตรงกัน" });
    }

    // Check if the email already exists in the database
    const sqlCheckEmail = `SELECT * FROM users WHERE email = ?`;
    db.get(sqlCheckEmail, [register_email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (user) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        try {
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(register_password, saltRounds);

            // Insert the new user into the database
            const sql = `INSERT INTO users (first_name, last_name, tel, email, password) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [register_firstname, register_lastname, register_tel, register_email, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error registering user", error: err.message });
                }
                res.status(200).json({ message: "Sign-up Successful"});
            });
        } catch (error) {
            return res.status(500).json({ message: "Error hashing password", error: error.message });
        }
    });
};

// Login user
const loginUser = (req, res) => {
    const { login_email, login_password } = req.body;

    // Retrieve user from the database
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [login_email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(login_password, user.password);
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

    const filters = {
        location: req.query.location || "",
        roomType: Array.isArray(req.query.roomType) ? req.query.roomType : req.query.roomType ? [req.query.roomType] : [],
        price: req.query.price || "",
    };

    let userSql = `SELECT * FROM Users WHERE user_id = ?`;
    let deptSql = `SELECT * FROM Departments`;
    let roomSql = `SELECT * FROM Room WHERE room_status = "available"`;
    let reviewSql = `
        SELECT room_id, SUM(rating) AS total_rating, COUNT(*) AS review_count
        FROM review
        GROUP BY room_id;
    `;
    let imgSql = `SELECT * FROM Room_Images`;
    let topRatedRoomsSql = `
        SELECT r.*, d.department_name, 
            COALESCE(AVG(rv.rating), 0) AS avg_rating
        FROM Room r
        LEFT JOIN review rv ON r.room_id = rv.room_id
        LEFT JOIN Departments d ON r.department_id = d.department_id
        WHERE r.room_status = "available"
        GROUP BY r.room_id
        ORDER BY avg_rating DESC
        LIMIT 10;
    `;
    const params = [req.cookies.userId];

    if (filters.location) {
        roomSql += ` AND department_id = ?`;
        params.push(filters.location);
    }

    if (filters.price) {
        const [minPrice, maxPrice] = filters.price.split("-").map(Number);
        roomSql += ` AND CAST(price AS INTEGER) BETWEEN ? AND ?`;
        params.push(minPrice, maxPrice);
    }

    const featureFilters = {
        pets: "pet_friendly",
        wifi: "wi_fi",
        tv: "TV",
        aircon: "air_conditioner",
        washing: "washing_machine",
        gym: "fitnaess",
        furniture: "furniture",
        fridge: "fridge",
        security: "closed_camera",
        lift: "lift",
        microwave: "microwave",
        parking: "parking"
    };

    filters.roomType.forEach(filter => {
        if (featureFilters[filter]) {
            roomSql += ` AND json_extract(room_have, '$.${featureFilters[filter]}') = 1`;
        }
    });

    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        db.all(deptSql, (err, deptData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            db.all(roomSql, params.slice(1), (err, roomData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
            
                db.all(reviewSql, (err, reviewData) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }

                    let reviewMap = {};
                    reviewData.forEach(rev => {
                        reviewMap[rev.room_id] = {
                            avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                        };
                    });

                    db.all(imgSql, (err, imgData) => {
                        if (err) {
                            return res.status(500).json({ message: "Database error", error: err.message });
                        }

                        db.all(topRatedRoomsSql, (err, topRooms) => {
                            if (err) {
                                return res.status(500).json({ message: "Database error", error: err.message });
                            }
                            res.render('main-user', {
                                user: userData,
                                room: roomData,
                                dept: deptData,
                                review: reviewMap,
                                img: imgData,
                                topRatedRooms: topRooms,
                                filters
                            });
                        });
                    });
                });
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
            res.render('wish-list', { fav: favData, user: userData});
        });
    });
}

const showDetails = (req, res) => {
    const room_id = req.params.room_id;
    const roomSql = `SELECT r.*, f.user_id, d.* FROM Room r 
                    JOIN Departments d ON r.department_id = d.department_id
                    LEFT JOIN Favorites f ON f.room_id = r.room_id AND f.user_id = ? 
                    WHERE r.room_id = ?;`;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    let reviewSql = `
        SELECT r.room_id, 
               AVG(r.rating) AS avg_rating, 
               COUNT(*) AS review_count, 
               GROUP_CONCAT(r.comment) AS comments, 
               GROUP_CONCAT(u.first_name) AS reviewers
        FROM review r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.room_id = ?
        GROUP BY r.room_id;
    `;
    let imgSql = `SELECT * FROM Room_Images WHERE room_id = ?`;
    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.get(roomSql, [req.cookies.userId, room_id], (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.get(reviewSql, [room_id], (err, reviewData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                db.all(imgSql, [room_id], (err, imgData) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }
                    const comments = reviewData ? reviewData.comments.split(',') : null;
                    const reviewers = reviewData ? reviewData.reviewers.split(',') : null;
                    const avgRating = reviewData ? reviewData.avg_rating : 0;
                    const reviewCount = reviewData ? reviewData.review_count : 0;
                    res.render('description', { 
                        room: roomData, 
                        user: userData, 
                        avgRating: avgRating,
                        reviewCount: reviewCount,
                        comments: comments,
                        reviewers: reviewers,
                        reviewData: reviewData,
                        img: imgData
                    });
                });
            });
        });
    });
};

const showHistory = (req, res) => {
    const userId = req.cookies.userId;
    const historySql = `
        SELECT r.room_name, c.contract_id, c.tenancy, c.people, h.history_status, h.history_date, r.price, r.bedroom, d.department_name, r.room_id, h.history_id, r.room_have
        FROM history h
        LEFT JOIN room r ON h.room_id = r.room_id
        LEFT JOIN contract c ON h.contract_id = c.contract_id
        LEFT JOIN departments d ON r.department_id = d.department_id
        WHERE h.user_id = ?;
    `;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    const imgSql = `
        SELECT ri.room_id, ri.room_img_id, ri.data
        FROM Room_Images ri
        INNER JOIN (
            SELECT room_id, MIN(room_img_id) as min_image_id 
            FROM Room_Images 
            GROUP BY room_id
        ) as img ON ri.room_id = img.room_id AND ri.room_img_id = img.min_image_id
    `;
    db.get(userSql, [userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(historySql, [userId], (err, historyData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.all(imgSql, (err, imgData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                const imgMap = {};
                imgData.forEach(img => {
                    imgMap[img.room_id] = img.room_img_id;
                });

                historyData.forEach(item => {
                    item.room_img_id = imgMap[item.room_id] || 'default.jpg';
                });
                res.render('history', {history : historyData, user : userData});
            });
        });
    });
};

const addFav = (req, res) => {
    const favSql = `INSERT INTO Favorites (user_id, room_id) VALUES (?, ?)`;
    const checkSql = `SELECT * FROM Favorites WHERE user_id = ? AND room_id = ?`;
    const deleteSql = `DELETE FROM Favorites WHERE user_id = ? AND room_id = ?`;
    const room_id = req.params.roomId;
    const user_id = req.cookies.userId;

    db.get(checkSql, [user_id, room_id], function (err, row) {
        if (err) {
            return res.status(500).json({ message: "Error : database error", error: err.message });
        }
        
        if (row) {  // If row exists
            db.run(deleteSql, [user_id, room_id], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error deleting favorite", error: err.message });
                }
                return res.redirect("/user/room-details/" + room_id);
            });
        } else {
            // If not found, insert
            db.run(favSql, [user_id, room_id], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error adding favorite", error: err.message });
                }
                res.redirect("/user/room-details/" + room_id);
            });
            }
    });
};

const showpayment = (req, res) => {
    const user_id = req.cookies.userId;
    const sql = `SELECT 
                users.*,
                room.*,
                departments.*,
                Payment.*,
                Payment_Images.pay_img_id
                FROM History
                JOIN users ON history.user_id = users.user_id
                JOIN room ON history.room_id = room.room_id
                JOIN departments ON room.department_id = departments.department_id
                JOIN Payment ON History.history_id = Payment.history_id
                LEFT JOIN Payment_Images ON Payment_Images.payment_id = Payment.payment_id
                WHERE History.user_id = ?
                ORDER BY payment.payment_date DESC,
                CASE 
                    WHEN payment.payment_status = 'Pending' THEN 1
                    WHEN payment.payment_status = 'Review' THEN 2
                    WHEN payment.payment_status = 'Completed' THEN 3 END;`
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    db.get(userSql, [user_id], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(sql, [user_id], (err, rows) => {
            if(err){
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            console.log(rows)
            res.render("payment", { data: rows, user : userData });
        })
    });
}
const update_payment = (req, res) => {
    const payment_id = req.params.payment_id;
    const file_name = `payment_${payment_id}`;
    const file_data = req.file.buffer;
    const sql = `INSERT INTO Payment_Images (payment_id, filename, data) values(?, ?, ?)`
    db.run(sql, [payment_id,file_name,file_data],(err) => {
        if(err){
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        const payment_sql = `UPDATE payment SET payment_status = 'Review' WHERE payment_id = ?`;
        db.run(payment_sql, [payment_id], (err) => {
            if(err){
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.redirect("/user/payment");
        });
    });
}

const showcontact = (req, res) => {
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    const user_id = req.cookies.userId;
    const room_id = req.params.room_id;
    const roomSql = `SELECT * FROM Room 
                    JOIN departments ON room.department_id = departments.department_id
                    WHERE room_id = ?`;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    db.get(userSql, [user_id], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.get(roomSql, [room_id], (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            console.log(userData, roomData)
            res.render("contract_user", { user : userData, roomData : roomData , today : today});
        });
    });
};

const create_history = (req, res) => {
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    console.log(req.body, req.file, req.params);
    const user_id = req.cookies.userId;
    const room_id = req.params.room_id;
    const data = {
        prefix: req.body.name,
        id_card: req.body.idcard,
        address: req.body.address,
        bank_name: req.body.bankselect,
        ac_number: req.body.accountNumber,
        ac_name: req.body.accountName,
        tenancy: req.body.moth,
        people: req.body.people,
    }
    const room_sql = `UPDATE room SET room_status = 'occupied' WHERE room_id = ?`;
    db.run(room_sql, [room_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
    });
    const contract_sql = `INSERT INTO contract (prefix, id_card, address, bank_name, ac_number, ac_name, tenancy, people) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const history_sql = `INSERT INTO history (user_id, room_id, contract_id, history_date) VALUES (?, ?, ?, ?)`;
    const history_img_sql = `INSERT INTO history_Images (history_id, filename, data) VALUES (?, ?, ?)`;
    db.run(contract_sql, [data.prefix, data.id_card, data.address, data.bank_name, data.ac_number, data.ac_name, data.tenancy, data.people], function(err) {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        const contractId = this.lastID;
        db.run(history_sql, [user_id, room_id, contractId, today], function(err) {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            const history_id = this.lastID;
            const file_name = `history_img_${history_id}`;
            const file_data = req.file.buffer;
            db.run(history_img_sql, [history_id, file_name, file_data], function(err) {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                res.redirect("/user/history");
            });
        });
    });
};

const cancel_history = (req, res) => {
    const history_id = req.params.history_id;
    const room_id = req.params.room_id;
    const room_sql = `UPDATE room SET room_status = 'available' WHERE room_id = ?`;
    const delete_sql = `DELETE FROM history WHERE history_id = ?`;
    db.run(delete_sql, [history_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
    });
    db.run(room_sql, [room_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
    });
    res.json({ success: true });
};

const showcontact_history = (req, res) => {
    const contract_id = req.params.contract_id;
    const user_id = req.cookies.userId;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    const sql = `SELECT *
        FROM contract c
        JOIN history h ON h.contract_id = c.contract_id
        JOIN users u ON u.user_id = h.user_id
        JOIN room r ON h.room_id = r.room_id
        JOIN departments d ON r.department_id = d.department_id
        JOIN History_Images i on h.history_id =i.history_id
        WHERE c.contract_id = ?`;
    db.get(sql, [contract_id], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.get(userSql, [user_id], (err, user) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.render("contract_user_show", { data : data, user:user});
        });
    });
};

const showDepartments = (req, res) => {
    const department_id = req.params.department_id;
    let deptSql = `SELECT * FROM Departments WHERE department_id = ?`;
    let roomSql = `SELECT * FROM Room WHERE room_status = "available"`;
    let reviewSql = `
        SELECT room_id, SUM(rating) AS total_rating, COUNT(*) AS review_count
        FROM review
        GROUP BY room_id;
    `;
    let imgSql = `SELECT * FROM Room_Images`;
    let userSql = `SELECT * FROM users`;
    db.all(deptSql, [department_id],(err, deptData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(roomSql, (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.all(reviewSql, (err, reviewData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                let reviewMap = {};
                reviewData.forEach(rev => {
                    reviewMap[rev.room_id] = {
                        avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                    };
                });
                db.all(imgSql, (err, imgData) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }
                    db.all(userSql, (err, userData) => {
                        if (err) {
                            return res.status(500).json({ message: "Database error", error: err.message });
                        }
                        let reviewMap = {};
                        reviewData.forEach(rev => {
                            reviewMap[rev.room_id] = {
                                avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                            };
                        });
                        res.render('see-all-resident-user', { dept: deptData, room: roomData, review: reviewMap, img: imgData, user: userData });
                    });
                });
            });
        });
    });
}

const writeReview = (req, res) => {
    user_id = req.params.user_id;
    room_id = req.params.room_id;

    const sql = `INSERT INTO review (user_id, room_id, rating, comment) VALUES (?, ?, ?, ?)`;
    db.run(sql, [user_id, room_id, req.body.rate, req.body.review], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
    });
}

//exports
module.exports = { registerUser, loginUser, showMain, showFav, showDetails, showHistory, addFav, showpayment, update_payment, showcontact, create_history, showDepartments, showcontact_history, writeReview, cancel_history};

