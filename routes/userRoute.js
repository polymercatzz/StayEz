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
router.get("/payment", checkAuth, userControl.showpayment);
router.get("/contact/:room_id", checkAuth, userControl.showcontact);
router.get("/showcontract/:contract_id", checkAuth, userControl.showcontact_history);
router.get("/department/:department_id", checkAuth, userControl.showDepartments);

//post
router.post('/register', userControl.registerUser);
router.post("/login", userControl.loginUser);
router.post("/addFav/:roomId", userControl.addFav);
router.post("/update_payment/:payment_id", upload.single('img'), userControl.update_payment);
router.post("/create_history/:room_id", upload.single('img'), userControl.create_history);
router.post("/cancel_history/:history_id/:room_id", userControl.cancel_history);
router.post("/review/:user_id/:room_id", userControl.writeReview);


module.exports = router;