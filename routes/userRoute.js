const express = require('express');
const userControl = require('../controllers/userControl');
const checkAuth = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

//get
router.get("/main", checkAuth, userControl.showMain);
router.get("/fav", checkAuth, userControl.showFav);
router.get("/room-details/:room_id", checkAuth, userControl.showDetails);
router.get("/history", checkAuth, userControl.showHistory);
router.get("/payment", userControl.showpayment);

//post
router.post('/register', userControl.registerUser);
router.post("/login", userControl.loginUser);
router.post("/addFav/:roomId", userControl.addFav);
router.post("/update_payment/:payment_id", upload.single('img'), userControl.update_payment)

module.exports = router;