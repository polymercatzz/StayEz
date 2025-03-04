require('dotenv').config();

const checkAdminAuth = (req, res, next) => {
    if (req.cookies.userId != process.env.ADMIN_ID) {
        return res.redirect("/login");
    }
    next();
};

module.exports = checkAdminAuth;
