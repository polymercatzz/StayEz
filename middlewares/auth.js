require('dotenv').config();

const checkAuth = (req, res, next) => {
    if (!req.cookies.userId) {
        return res.redirect("/login");
    }
    next();
};

// const checkAdmin = (req, res, next) => {
//     if (req.cookies.userId !== process.env.ADMIN_ID) {
//         return res.status(403).json({ message: "This page for admin only" });
//     }
//     next();
// };

module.exports = checkAuth;