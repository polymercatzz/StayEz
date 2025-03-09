const express = require('express');
const checkAd = require("../middlewares/adminAuth");
const adminControl = require('../controllers/adminControl');

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/main", checkAd, adminControl.show_main_admin);
router.get("/manage_booking", checkAd, adminControl.show_manage_booking);
router.get("/manage_user", checkAd, adminControl.show_manage_user);
router.get("/manage_room", checkAd, adminControl.show_manage_room);
router.get("/edit_room/:room_id", checkAd, adminControl.show_edit_room);
router.get("/create_room", checkAd, adminControl.show_create_room);
router.get("/manage_rent", checkAd, adminControl.show_calulate);
router.get("/history_rent", checkAd, adminControl.show_history_rent);
router.get("/room-details/:room_id", checkAd, adminControl.showDetails);
router.get("/contact/:contract_id", checkAd, adminControl.show_contact);
router.get("/monthly", checkAd, adminControl.showMonthlyPayment);



router.post("/updatebookstatus/:history_id", adminControl.updatebookstatus);
router.post("/updateuserstatus/:user_id", adminControl.updateuserstatus);
router.post("/create_user", adminControl.create_user);
router.post("/delete_user/:user_id", adminControl.delete_user);
router.post("/updateroom/:room_id", adminControl.update_room);
router.post("/createroom", upload.array('imageFiles'), adminControl.create_room);
router.post("/deleteroom/:room_id", adminControl.delete_room);
router.post("/createpayment/:room_id/:history_id", adminControl.create_payment);
router.post("/updatepayment/:payment_id", adminControl.update_payment);
router.post("/monthly/:year/:month", adminControl.updateMonthlyPayment);



module.exports = router;
