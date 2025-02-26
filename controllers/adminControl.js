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

module.exports = { show_main_admin, show_manage_room, show_manage_booking};