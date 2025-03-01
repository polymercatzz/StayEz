const express = require('express');
const userControl = require('../controllers/userControl');
const checkAuth = require("../middlewares/auth");

const router = express.Router();

//get
router.get("/main", checkAuth, userControl.getUserProfile);

//post
router.post('/register', userControl.registerUser);
router.post("/login", userControl.loginUser);

module.exports = router;