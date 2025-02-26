const express = require("express");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute"); // import routes user
const adminRoutes = require("./routes/adminRoute"); // import routes admin
const checkAuth = require("./middlewares/auth"); // import middleware
const path = require("path");
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
    res.sendFile(path.join(__dirname, '/public/html/main-regis.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/html/login.html'));
});

app.get('/main', checkAuth, (req, res) => { 
  res.sendFile(path.join(__dirname, '/public/html/main-user.html'));
});

//logout
app.get("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/login")
  console.log("logout", req.cookies.userId);
});

//api
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);


app.listen(port, () => {
   console.log("The server was running on : http://localhost:3000");
 });