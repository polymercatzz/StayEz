const express = require('express');
const userControl = require('../controllers/userControl');
const checkAuth = require("../middlewares/auth");

const router = express.Router();

//get
router.get("/main", checkAuth, userControl.showMain);
router.get("/fav", checkAuth, userControl.showFav);
router.get("/room-details/:room_id", checkAuth, userControl.showDetails);
router.get("/history", checkAuth, userControl.showHistory);

//post
router.post('/register', userControl.registerUser);
router.post("/login", userControl.loginUser);
router.post("/addFav/:roomId", userControl.addFav);

module.exports = router;