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
    const filters = {
      location: req.query.location || "",
      roomType: Array.isArray(req.query.roomType) ? req.query.roomType : req.query.roomType ? [req.query.roomType] : [],
      price: req.query.price || "",
  };

  let userSql = `SELECT * FROM Users WHERE user_id = ?`;
  let deptSql = `SELECT * FROM Departments`;
  let roomSql = `SELECT * FROM Room WHERE room_status = "available"`;
  let reviewSql = `
      SELECT room_id, SUM(rating) AS total_rating, COUNT(*) AS review_count
      FROM review
      GROUP BY room_id;
  `;
  let imgSql = `SELECT * FROM Room_Images`;
  let topRatedRoomsSql = `
        SELECT r.*, d.department_name, 
            COALESCE(SUM(rv.rating) / COUNT(rv.room_id), 0) AS avg_rating
        FROM Room r
        LEFT JOIN review rv ON r.room_id = rv.room_id
        LEFT JOIN Departments d ON r.department_id = d.department_id
        GROUP BY r.room_id
        ORDER BY avg_rating DESC
        LIMIT 10;
    `;
  const params = [req.cookies.userId];

  if (filters.location) {
      roomSql += ` AND department_id = ?`;
      params.push(filters.location);
  }

  if (filters.price) {
      const [minPrice, maxPrice] = filters.price.split("-").map(Number);
      roomSql += ` AND CAST(price AS INTEGER) BETWEEN ? AND ?`;
      params.push(minPrice, maxPrice);
  }

  const featureFilters = {
      pets: "pet_friendly",
      wifi: "wi_fi",
      tv: "TV",
      aircon: "air_conditioner",
      washing: "washing_machine",
      gym: "fitnaess",
      furniture: "furniture",
      fridge: "fridge",
      security: "closed_camera",
      lift: "lift",
      microwave: "microwave",
      parking: "parking"
  };

  filters.roomType.forEach(filter => {
      if (featureFilters[filter]) {
          roomSql += ` AND json_extract(room_have, '$.${featureFilters[filter]}') = 1`;
      }
  });

      db.all(deptSql, (err, deptData) => {
          if (err) {
              return res.status(500).json({ message: "Database error", error: err.message });
          }

          db.all(roomSql, params.slice(1), (err, roomData) => {
              if (err) {
                  return res.status(500).json({ message: "Database error", error: err.message });
              }
          
              db.all(reviewSql, (err, reviewData) => {
                  if (err) {
                      return res.status(500).json({ message: "Database error", error: err.message });
                  }

                  let reviewMap = {};
                  reviewData.forEach(rev => {
                      reviewMap[rev.room_id] = {
                          avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                      };
                  });

                  db.all(imgSql, (err, imgData) => {
                      if (err) {
                          return res.status(500).json({ message: "Database error", error: err.message });
                      }
                      db.all(topRatedRoomsSql, (err, topRooms) => {
                        if (err) {
                            return res.status(500).json({ message: "Database error", error: err.message });
                        }
                        console.log(topRooms);
                        res.render('main-regis', {
                            room: roomData,
                            dept: deptData,
                            review: reviewMap,
                            img: imgData,
                            topRatedRooms: topRooms,
                            filters
                        });
                    });
                  });
              });
          });
          
      });
});

app.get('/room-details/:room_id', (req, res) => {
  const room_id = req.params.room_id;

    const roomSql = `SELECT * FROM Room WHERE room_id = ?`;
    const userSql = `SELECT * FROM Users WHERE user_id = ?`;
    let reviewSql = `
        SELECT r.room_id, 
               AVG(r.rating) AS avg_rating, 
               COUNT(*) AS review_count, 
               GROUP_CONCAT(r.comment) AS comments, 
               GROUP_CONCAT(u.first_name) AS reviewers
        FROM review r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.room_id = ?
        GROUP BY r.room_id;
    `;
    let imgSql = `SELECT * FROM Room_Images WHERE room_id = ?`;
    db.get(userSql, [req.cookies.userId], (err, userData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.get(roomSql, [room_id], (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.get(reviewSql, [room_id], (err, reviewData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                db.all(imgSql, [room_id], (err, imgData) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }
                    const comments = reviewData ? reviewData.comments.split(',') : null;
                    const reviewers = reviewData ? reviewData.reviewers.split(',') : null;
                    const avgRating = reviewData ? reviewData.avg_rating : 0;
                    const reviewCount = reviewData ? reviewData.review_count : 0;

                    res.render('description-regis', { 
                        room: roomData, 
                        user: userData, 
                        avgRating: avgRating,
                        reviewCount: reviewCount,
                        comments: comments,
                        reviewers: reviewers,
                        reviewData: reviewData,
                        img: imgData
                    });
                });
            });
        });
    });
});

app.get('/department/:department_id', (req, res) => {
  const department_id = req.params.department_id;
    let deptSql = `SELECT * FROM Departments WHERE department_id = ?`;
    let roomSql = `SELECT * FROM Room WHERE room_status = "available"`;
    let reviewSql = `
        SELECT room_id, SUM(rating) AS total_rating, COUNT(*) AS review_count
        FROM review
        GROUP BY room_id;
    `;
    let imgSql = `SELECT * FROM Room_Images`;
    let topRatedRoomsSql = `
        SELECT r.*, COALESCE(SUM(rv.rating) / COUNT(rv.room_id), 0) AS avg_rating
        FROM Room r
        LEFT JOIN review rv ON r.room_id = rv.room_id
        GROUP BY r.room_id
        ORDER BY avg_rating DESC
        LIMIT 10;
    `;
    db.all(deptSql, [department_id],(err, deptData) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err.message });
        }
        db.all(roomSql, (err, roomData) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err.message });
            }
            db.all(reviewSql, (err, reviewData) => {
                if (err) {
                    return res.status(500).json({ message: "Database error", error: err.message });
                }
                let reviewMap = {};
                reviewData.forEach(rev => {
                    reviewMap[rev.room_id] = {
                        avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                    };
                });
                db.all(imgSql, (err, imgData) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err.message });
                    }
                    let reviewMap = {};
                    reviewData.forEach(rev => {
                        reviewMap[rev.room_id] = {
                            avgRating: rev.review_count > 0 ? (rev.total_rating / rev.review_count).toFixed(1) : 0
                        };
                    });
                    res.render('see-all-resident-regis', { dept: deptData, room: roomData, review: reviewMap, img: imgData });
                });
            });
        });
    });
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

app.get('/payment_img/:id', (req, res) => {
  const imageId = req.params.id;
  db.get("SELECT filename, data FROM Payment_Images WHERE pay_img_id = ?", [imageId], (err, row) => {
      if (err || !row) {
          return res.status(404).json({ message: "Image not found" });
      }
      res.setHeader("Content-Type", "image/jpeg");
      res.send(row.data);
  });
});

app.get('/history_img/:id', (req, res) => {
  const imageId = req.params.id;
  db.get("SELECT filename, data FROM history_Images WHERE his_img_id = ?", [imageId], (err, row) => {
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