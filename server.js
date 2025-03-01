const express = require("express");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute"); // import routes user
const adminRoutes = require("./routes/adminRoute"); // import routes admin
const checkAuth = require("./middlewares/auth"); // import middleware
const db = require("./server/database");
const path = require("path");
require('dotenv').config();
const port = 3000;

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Set EJS
app.set('view engine', 'ejs');
// Set public directory
app.use(express.static(path.join(__dirname, 'public')));


// routing path
app.get('/', (req, res) => {
  const roomSql = `SELECT * FROM Room WHERE room_status = "available" ORDER BY department_id`;
  const deptSql = `SELECT * FROM Departments`;
  db.all(roomSql, (err, roomData) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    db.all(deptSql, (err, deptData) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      res.render('main-regis', { room: roomData, dept: deptData});
            });
        });
    });

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/html/login.html'));
});


app.get('/room_img/:id', (req, res) => {
  const imageId = req.params.id;
  db.get("SELECT filename, data FROM room_images WHERE room_img_id = ?", [imageId], (err, row) => {
      if (err || !row) {
          return res.status(404).json({ message: "Image not found" });
      }
      res.setHeader("Content-Type", "image/jpeg");
      res.send(row.data);
  });
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login")
  // console.log("logout", req.cookies.userId);
});

//add default 404
// app.use((req, res, next) => {
//   res.status(404).sendFile(path.join(__dirname, '/public/html/404.html'));
// });

//api
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);


app.listen(port, () => {
   console.log("The server was running on : http://localhost:3000");
 });