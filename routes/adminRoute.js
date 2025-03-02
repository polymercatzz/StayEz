const express = require('express');
const adminControl = require('../controllers/adminControl');

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/main", adminControl.show_main_admin);
router.get("/manage_booking", adminControl.show_manage_booking);
router.get("/manage_user", adminControl.show_manage_user);
router.get("/userdetail/:user_id", adminControl.show_user_detail);
router.get("/manage_room", adminControl.show_manage_room);
router.get("/edit_room/:room_id", adminControl.show_edit_room);
router.get("/create_room", adminControl.show_create_room);
router.get("/manage_rent", adminControl.show_calulate);


router.post("/updatebookstatus/:history_id", adminControl.updatebookstatus);
router.post("/updateuserstatus/:user_id", adminControl.updateuserstatus);
router.post("/delete_user/:user_id", adminControl.delete_user);
router.post("/updateroom/:room_id", adminControl.update_room);
router.post("/createroom", upload.array('imageFiles'), adminControl.create_room);
router.post("/deleteroom/:room_id", adminControl.delete_room);
router.post("/createpayment/:room_id/:history_id", adminControl.create_payment);



module.exports = router;