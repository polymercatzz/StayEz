const express = require('express');
const adminControl = require('../controllers/adminControl');

const router = express.Router();

router.get("/main", adminControl.show_main_admin);
router.get("/manage_booking", adminControl.show_manage_booking);
router.get("/manage_user", adminControl.show_manage_user);
router.get("/userdetail/:user_id", adminControl.show_user_detail);


router.post("/updatebookstatus/:history_id", adminControl.updatebookstatus);
router.post("/updateuserstatus/:user_id", adminControl.updateuserstatus);
router.post("/delete_user/:user_id", adminControl.delete_user);


module.exports = router;