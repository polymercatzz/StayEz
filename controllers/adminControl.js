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
    const room_sql = `SELECT * FROM room JOIN departments ON room.department_id = departments.department_id WHERE room_id = ?`;
    db.get(room_sql, [room_id], (err, room) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        const dept_sql = `SELECT * FROM departments`;
        db.all(dept_sql, [], (err, dept) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            let room_have = JSON.parse(room.room_have);
            res.render('editroom', { data: room, room_have: room_have, dept: dept });
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
    // req.files.forEach(file => {
    //     const filename = file.originalname;
    //     const fileData = file.buffer;
    //     console.log("Filename: ", filename);
    // });
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
            res.redirect("/admin/manage_room");
        });
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

const updateuserstatus = (req, res) => {
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


module.exports = { show_main_admin, show_manage_user, updateuserstatus, delete_user, show_user_detail, show_manage_room, show_edit_room, show_create_room, create_room, update_room, show_manage_booking, updatebookstatus };