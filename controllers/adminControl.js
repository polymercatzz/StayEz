const path = require("path");
const db = require("../server/database");

const show_main_admin = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/admin.html'));
};

const show_manage_room = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/something'));
};

const show_manage_booking = (req, res) => {
    const sql = `SELECT * FROM history
    JOIN users ON history.user_id = users.user_id
    JOIN room ON history.room_id = room.room_id
    JOIN contract ON history.contract_id = contract.contract_id`;
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

module.exports = { show_main_admin, show_manage_user, updateuserstatus, delete_user, show_user_detail, show_manage_room, show_manage_booking, updatebookstatus};