const path = require("path");
const db = require("../server/database");

const show_main_admin = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/admin.html'));
};

const show_manage_room = (req, res) => {
    const sql = `SELECT 
        room.*,
        departments.*,
        history.user_id,
        users.first_name,
        users.last_name
    FROM room 
    JOIN departments ON room.department_id = departments.department_id
    LEFT JOIN history ON room.room_id = history.room_id
    LEFT JOIN users ON history.user_id = users.user_id
    ORDER BY department_id;`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(rows);
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
                res.render('editroom', { data: room, room_have: room_have, dept: dept, image: image});
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
            parking: req.body.parking == 'on'
        })
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
        const sql = `UPDATE room SET room_name = ?, department_id = ?, size = ?, price = ?, p_electric = ?, p_water = ?, deposit = ?, pay_advance = ?, bedroom = ?, detail = ?, room_have = ? WHERE room_id = ?`;
        db.run(sql, [data.room_name, department_id, data.size, data.price, data.p_electric, data.p_water, data.deposit, data.pay_advance, data.bedroom, data.detail, data.room_have, room_id], (err) => {
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
        console.log(rows);
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
        })
    };
    console.log(data, department_id);
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
        const sql = `INSERT INTO room (room_name, size, price, p_electric, p_water, deposit, pay_advance, bedroom, detail, room_have, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [data.room_name, data.size, data.price, data.p_electric, data.p_water, data.deposit, data.pay_advance, data.bedroom, data.detail, data.room_have, department_id], (err) => {
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
    const sql = `SELECT * FROM history
    JOIN users ON history.user_id = users.user_id
    JOIN room ON history.room_id = room.room_id
    JOIN contract ON history.contract_id = contract.contract_id
    JOIN departments ON room.department_id = departments.department_id;`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(rows);
        res.render("managebook", { data: rows });
    });
};

const updatebookstatus = (req, res) => {
    const history_id = req.params.history_id;
    const status = req.body.status;
    const sql = `UPDATE history SET history_status = ? WHERE history_id = ?`;
    db.run(sql, [status, history_id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_booking");
    });
};

const show_manage_user = (req, res) => {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(rows);
        res.render("manageuser", { data: rows });
    });
};

const updateuserstatus = (req, resredirect) => {
    const user_id = req.params.user_id;
    const status = req.body.status;
    const sql = `UPDATE users SET user_status = ? WHERE user_id = ?`;
    console.log(status, user_id);
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

const show_calulate = (req, res) =>{
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
        if (err){
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        console.log(rows);
        res.render("calculate", {history : rows});
    });
};


const create_payment = (req, res) => {
    console.log(req.params);
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
        if(err){
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        let r_other_json = {};
        const other_name = req.body.other;
        const r_other = req.body.r_other;
        if (Array.isArray(other_name)) {
            other_name.forEach(function(item, index) {
                r_other_json[item] = Number(r_other[index]);
        });
        } else if (other_name){
            r_other_json[other_name] = Number(r_other);
        }
        data = {
            r_electric: electricity*Number(room.p_electric),
            r_water: water*Number(room.p_water),
            r_other: JSON.stringify(r_other_json),
            date: `${year}-${month}-${day}`
        };
        console.log(data, history_id);
        const payment_sql = `INSERT INTO payment (history_id, r_electric, r_water, r_other, payment_date) VALUES ( ?, ?, ?, ?, ?)`;
        db.run(payment_sql, [history_id, data.r_electric, data.r_water, data.r_other, data.date], (err) => {
            if(err){
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
        if(err){
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        res.redirect("/admin/manage_rent");
    });
};

module.exports = { show_main_admin, show_manage_user, updateuserstatus, delete_user, show_user_detail, show_manage_room, show_edit_room, show_create_room, create_room, update_room, delete_room, show_manage_booking, updatebookstatus, show_calulate, create_payment, update_payment};