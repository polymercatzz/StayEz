require('dotenv').config();

const checkAuth = (req, res, next) => {
    if (!req.cookies.userId) {
        return res.redirect("/login");
    }
    next();
};



module.exports = checkAuth;