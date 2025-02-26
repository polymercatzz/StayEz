const express = require('express');
const adminControl = require('../controllers/adminControl');

const router = express.Router();

router.get("/main", adminControl.show_main_admin);
router.get("/manage_booking", adminControl.show_manage_booking);


module.exports = router;