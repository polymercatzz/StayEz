const path = require("path");
const db = require("../server/database");
const bcrypt = require("bcrypt");


const show_main_admin = (req, res) => {
    const sql = `SELECT * FROM report`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("admin", { data: rows });
    });
};

const show_manage_room = (req, res) => {
    const sql = `SELECT 
        room.*,
        departments.*,
        history.user_id,
        users.first_name,
        users.last_name,
        GROUP_CONCAT(room_images.room_img_id) AS images_id
    FROM room 
    JOIN departments ON room.department_id = departments.department_id
    JOIN room_images ON room.room_id = room_images.room_id
    LEFT JOIN history ON room.room_id = history.room_id
    LEFT JOIN users ON history.user_id = users.user_id
    GROUP BY room.room_id;
    ORDER BY department_id;`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render('manageroom', { data: rows });
    });
};

const show_edit_room = (req, res) => {
    const room_id = req.params.room_id;
    const room_sql = `SELECT * FROM room JOIN departments ON room.department_id = departments.department_id WHERE room_id = ?;`;
    db.get(room_sql, [room_id], (err, room) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        const imgroom_sql = `SELECT * FROM room_images WHERE room_id = ?;`;
        db.all(imgroom_sql, [room_id], (err, image) => {
            const dept_sql = `SELECT * FROM departments`;
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.all(dept_sql, (err, dept) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                let room_have = JSON.parse(room.room_have);
                res.render('editroom', { data: room, room_have: room_have, dept: dept, image: image });
            });
        });
    });
};

const update_room = (req, res) => {
    const department_id = req.body.department_id;
    const room_id = req.params.room_id;
    const dept_sql = `SELECT * FROM departments Where department_id = ?`;
    const data = {
        room_name: req.body.room_name,
        size: Number(req.body.size),
        price: Number(req.body.price),
        p_electric: Number(req.body.p_electric),
        p_water: Number(req.body.p_water),
        deposit: Number(req.body.deposit),
        pay_advance: Number(req.body.pay_advance),
        bedroom: Number(req.body.bedroom),
        detail: req.body.detail,
        room_have: JSON.stringify({
            air_conditioner: req.body.air_conditioner == 'on',
            wi_fi: req.body.wi_fi == 'on',
            TV: req.body.TV == 'on',
            washing_machine: req.body.washing_machine == 'on',
            fitnaess: req.body.fitnaess == 'on',
            furniture: req.body.furniture == 'on',
            pet_friendly: req.body.pet_friendly == 'on',
            fridge: req.body.fridge == 'on',
            closed_camera: req.body.closed_camera == 'on',
            lift: req.body.lift == 'on',
            microwave: req.body.microwave == 'on',
            parking: req.body.parking == 'on',

        }),
        map: req.body.map
    };
    db.get(dept_sql, [department_id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!row) {
            const create_dept_sql = `INSERT INTO departments (department_id, department_name) VALUES (?, ?)`;
            db.run(create_dept_sql, [department_id, req.body.department_name], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
            });
        }
        const sql = `UPDATE room SET room_name = ?, department_id = ?, size = ?, price = ?, p_electric = ?, p_water = ?, deposit = ?, pay_advance = ?, bedroom = ?, detail = ?, room_have = ?, map = ? WHERE room_id = ?`;
        db.run(sql, [data.room_name, department_id, data.size, data.price, data.p_electric, data.p_water, data.deposit, data.pay_advance, data.bedroom, data.detail, data.room_have, data.map, room_id], (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.redirect("/admin/manage_room");
        }
        );
    });
};

const show_create_room = (req, res) => {
    const sql = `SELECT * FROM departments`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render('createroom', { data: rows });
    });
};

const create_room = (req, res) => {
    const department_id = req.body.department_id;
    const data = {
        room_name: req.body.room_name,
        size: Number(req.body.size),
        price: Number(req.body.price),
        p_electric: Number(req.body.p_electric),
        p_water: Number(req.body.p_water),
        deposit: Number(req.body.deposit),
        pay_advance: Number(req.body.pay_advance),
        bedroom: Number(req.body.bedroom),
        detail: req.body.detail,
        room_have: JSON.stringify({
            air_conditioner: req.body.air_conditioner == 'on',
            wi_fi: req.body.wi_fi == 'on',
            TV: req.body.TV == 'on',
            washing_machine: req.body.washing_machine == 'on',
            fitnaess: req.body.fitnaess == 'on',
            furniture: req.body.furniture == 'on',
            pet_friendly: req.body.pet_friendly == 'on',
            fridge: req.body.fridge == 'on',
            closed_camera: req.body.closed_camera == 'on',
            lift: req.body.lift == 'on',
            microwave: req.body.microwave == 'on',
            parking: req.body.parking == 'on'
        }),
        map: req.body.map
    };
    const dept_sql = `SELECT * FROM departments WHERE department_id = ?`;
    db.get(dept_sql, [department_id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        if (!row) {
            const create_dept_sql = `INSERT INTO departments (department_id, department_name) VALUES (?, ?)`;
            db.run(create_dept_sql, [department_id, req.body.department_name], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
            });
        }
        const sql = `INSERT INTO room (room_name, size, price, p_electric, p_water, deposit, pay_advance, bedroom, detail, room_have, department_id, map) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [data.room_name, data.size, data.price, data.p_electric, data.p_water, data.deposit, data.pay_advance, data.bedroom, data.detail, data.room_have, department_id, data.map], (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            if (req.files) {
                const room_sql = `SELECT room_id FROM room ORDER BY room_id DESC;`;
                db.get(room_sql, (err, room) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }
                    if (!room) {
                        return res.status(404).json({ message: "No room found" });
                    }
                    const last_id = room.room_id;
                    req.files.forEach((file, index) => {
                        let file_name = `room_${last_id}_${index + 1}`;
                        let file_data = file.buffer;
                        let img_sql = `INSERT INTO room_images (room_id, filename, data) VALUES (?, ?, ?)`;
                        db.run(img_sql, [last_id, file_name, file_data], (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Database error", error: err.message });
                            }
                        });
                    });
                });
            }
            res.redirect("/admin/manage_room");
        });
    });
};

const delete_room = (req, res) => {
    const room_id = req.params.room_id;
    const sql = `DELETE FROM room WHERE room_id = ?`;
    db.run(sql, [room_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_room");
    });
};

const show_manage_booking = (req, res) => {
    const sql = `SELECT 
                history.*,
                users.*,
                room.*,
                GROUP_CONCAT(room_images.room_img_id) AS images_id,
                contract.*,
                departments.*
    FROM history
    JOIN users ON history.user_id = users.user_id
    JOIN room ON history.room_id = room.room_id
    JOIN room_images ON room.room_id = room_images.room_id
    JOIN contract ON history.contract_id = contract.contract_id
    JOIN departments ON room.department_id = departments.department_id
    GROUP BY room.room_id;`;;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("managebook", { data: rows });
    });
};

const updatebookstatus = (req, res) => {
    const history_id = req.params.history_id;
    const status = req.body.status;
    if (status == "cancelled") {
        const history_sql = "SELECT room_id FROM history WHERE history_id = ?"
        const room_sql = `UPDATE room SET room_status = 'available' WHERE room_id = ?`;
        const delete_sql = `DELETE FROM history WHERE history_id = ?`;
        db.get(history_sql, [history_id], (err, row) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.run(room_sql, [row.room_id], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
            });
        });
        db.run(delete_sql, [history_id], (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
        });
    } else {
        const sql = `UPDATE history SET history_status = ? WHERE history_id = ?`;
        db.run(sql, [status, history_id], (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.redirect("/admin/manage_booking");
        });
    }

};

const show_manage_user = (req, res) => {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("manageuser", { data: rows });
    });
};

const updateuserstatus = (req, res) => {
    const user_id = req.params.user_id;
    const status = req.body.status;
    const sql = `UPDATE users SET user_status = ? WHERE user_id = ?`;
    db.run(sql, [status, user_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_user");
    });
};

const show_user_detail = (req, res) => {
    const user_id = req.params.user_id;
    const sql = `SELECT * FROM users WHERE user_id = ?`;
    db.get(sql, [user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.send(row);
    });
}

const delete_user = (req, res) => {
    const user_id = req.params.user_id;
    const sql = `DELETE FROM users WHERE user_id = ?`;
    db.run(sql, [user_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_user");
    });
};

const show_calulate = (req, res) => {
    const sql = `SELECT 
                history.*,
                users.*,
                room.*,
                departments.*,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.payment_id ELSE NULL END AS payment_id,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.r_electric ELSE NULL END AS r_electric,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.r_water ELSE NULL END AS r_water,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.r_other ELSE NULL END AS r_other,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.payment_date ELSE NULL END AS payment_date,
                CASE 
                    WHEN strftime('%m', payment.payment_date) = strftime('%m', 'now') 
                    AND strftime('%Y', payment.payment_date) = strftime('%Y', 'now')
                    THEN payment.payment_status ELSE NULL END AS payment_status,
                Payment_Images.pay_img_id
                FROM history
                JOIN users ON history.user_id = users.user_id
                JOIN room ON history.room_id = room.room_id
                JOIN departments ON room.department_id = departments.department_id
                LEFT JOIN payment ON history.history_id = payment.history_id
                LEFT JOIN Payment_Images ON Payment_Images.payment_id = Payment.payment_id
                WHERE history.history_status = 'completed'
                    AND (payment.payment_id = (
                    SELECT payment_id
                    FROM Payment 
                    WHERE history_id = history.history_id
                    ORDER BY payment_date DESC
                    LIMIT (1)) OR payment.payment_id ISNULL);`
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("calculate", { history: rows });
    });
};

const show_history_rent = (req, res) => {
    const sql = `SELECT 
                history.*,
                users.*,
                room.*,
                departments.*,
                payment.payment_id,
                payment.r_electric,
                payment.r_water,
                payment.r_other,
                payment.payment_date,
                payment.payment_status,
                Payment_Images.pay_img_id
                FROM history
                JOIN users ON history.user_id = users.user_id
                JOIN room ON history.room_id = room.room_id
                JOIN departments ON room.department_id = departments.department_id
                JOIN payment ON history.history_id = payment.history_id
                LEFT JOIN Payment_Images ON Payment_Images.payment_id = Payment.payment_id
                WHERE history.history_status = 'completed';`
    db.all(sql, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("history_rent.ejs", { history: rows });
    });
};


const create_payment = (req, res) => {
    const room_id = req.params.room_id;
    const history_id = req.params.history_id;
    const electricity = parseFloat(req.body.electricity);
    const water = parseFloat(req.body.water);
    const date = new Date();
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let data = {};
    const room_sql = `SELECT * FROM room WHERE room_id = ?`
    db.get(room_sql, [room_id], (err, room) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        let r_other_json = {};
        const other_name = req.body.other;
        const r_other = req.body.r_other;
        if (Array.isArray(other_name)) {
            other_name.forEach(function (item, index) {
                r_other_json[item] = Number(r_other[index]);
            });
        } else if (other_name) {
            r_other_json[other_name] = Number(r_other);
        }
        data = {
            r_electric: electricity * Number(room.p_electric),
            r_water: water * Number(room.p_water),
            r_other: JSON.stringify(r_other_json),
            date: `${year}-${month}-${day}`
        };
        const payment_sql = `INSERT INTO payment (history_id, r_electric, r_water, r_other, payment_date) VALUES ( ?, ?, ?, ?, ?)`;
        db.run(payment_sql, [history_id, data.r_electric, data.r_water, data.r_other, data.date], (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            res.redirect("/admin/manage_rent")
        });
    });

};

const update_payment = (req, res) => {
    const payment_status = req.body.payment_status;
    const payment_id = req.params.payment_id;
    const sql = `UPDATE payment SET payment_status = ? WHERE payment_id = ?`
    db.run(sql, [payment_status, payment_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_rent");
    });
};

const show_contact = (req, res) => {
    const contract_id = req.params.contract_id;
    const sql = `SELECT *
        FROM contract c
        JOIN history h ON h.contract_id = c.contract_id
        JOIN users u ON u.user_id = h.user_id
        JOIN room r ON h.room_id = r.room_id
        JOIN departments d ON r.department_id = d.department_id
        JOIN History_Images i on h.history_id =i.history_id
        WHERE c.contract_id = ?`;
    db.get(sql, [contract_id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.render("contract_admin_show", { data: row });
    });

};

const showMonthlyPayment = (req, res) => {
    const monthSql = `SELECT * FROM report ORDER BY date`;
    const datamonth = `SELECT 
                        strftime('%Y-%m', payment_date) AS month,
                        SUM(price) AS total_rent,
                        SUM(r_electric) AS total_electric, 
                        SUM(r_water) AS total_water, 
                        '[' || GROUP_CONCAT(r_other, ',') || ']' AS total_other
                    FROM Payment
                    JOIN History ON History.history_id = Payment.history_id
                    JOIN room ON room.room_id = History.room_id
                    GROUP BY strftime('%Y-%m', payment_date)
                    HAVING Payment.payment_status != "Pending";
                    ORDER BY payment_date`;
    db.all(monthSql, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(datamonth, (err, data) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            data.forEach(monthData => {
                const totalOtherArray = JSON.parse(monthData.total_other);
                const totalOtherSum = totalOtherArray.reduce((sum, item) => {
                    for (const key in item) {
                        sum += item[key] || 0;
                    }
                    return sum;
                }, 0);
                monthData.total_other_sum = totalOtherSum;
            });
            res.render("select-month", {
                monthly: rows,
                datamonth: data
            });
        });
    });
}



const updateMonthlyPayment = (req, res) => {
    const { year, month } = req.params;
    const { water_bill, electric_bill, other_bill, rent, water_income, electric_income, other_income } = req.body;

    const waterInt = Number(water_bill) || 0;
    const electricityInt = Number(electric_bill) || 0;
    const otherInt = Number(other_bill) || 0;

    const amount = waterInt + electricityInt + otherInt;
    const date = year + "-" + month;

    console.log(amount, date, { water_bill, electric_bill, other_bill, rent, water_income, electric_income, other_income });
    const sql = `INSERT INTO Report (rent, water_income, electric_income, other_income, water_bill, electric_bill, other_bill, total_amount, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    db.run(sql, [rent, water_income, electric_income, other_income, waterInt, electricityInt, otherInt, amount, date], (err) => {
        if (err) {
            console.log({ message: "Database error", error: err.message });
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.json({ message: "บันทึกข้อมูลสำเร็จ" });
    });
}

const create_user = (req, res) => {
    const { firstname, lastname, tel, email, password, confirmPassword } = req.body;
    if (!firstname || !lastname || !tel || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "รหัสผ่านไม่ตรงกัน" });
    }
    console.log({ firstname, lastname, tel, email, password, confirmPassword });
    // Check if the email already exists in the database
    const sqlCheckEmail = `SELECT * FROM users WHERE email = ?`;
    db.get(sqlCheckEmail, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (user) {
            return res.status(400).json({ message: "อีเมล์นี้ได้ลงทะเบียนไว้แล้ว" });
        }

        try {
            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert the new user into the database
            const sql = `INSERT INTO users (first_name, last_name, tel, email, password) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [firstname, lastname, tel, email, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ message: "Error registering user", error: err.message });
                }
                res.status(200).json({ message: "Successful"});
            });
        } catch (error) {
            return res.status(500).json({ message: "Error hashing password", error: error.message });
        }
    });
};

const showDetails = (req, res) => {
    const room_id = req.params.room_id;
    const roomSql = `SELECT * FROM Room r
                    JOIN Departments d ON r.department_id = d.department_id
                    WHERE r.room_id = ?`;
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
    db.get(roomSql, [room_id], (err, roomData) => {
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
                console.log(roomData);
                res.render('description-admin', {
                    room: roomData,
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
};
module.exports = { show_main_admin, show_manage_user, updateuserstatus, delete_user, show_user_detail, show_manage_room, show_edit_room, show_create_room, create_room, update_room, delete_room, show_manage_booking, updatebookstatus, show_calulate, show_history_rent, create_payment, update_payment, showMonthlyPayment, updateMonthlyPayment, show_contact, create_user, showDetails };

