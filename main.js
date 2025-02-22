const express = require("express");
const path = require("path");
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });


const app = express();
// Set EJS as templating engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// routing path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/main-user.html'));
});


app.listen(port, () => {
   console.log("http://localhost:3000");
 });