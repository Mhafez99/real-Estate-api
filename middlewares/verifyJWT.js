const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const verifyJWT = (req, res, next) => {
    const token = req.cookies.access_Token;

    if (!token) {
        const error = appError.create("Unauthorized", 401, httpStatusText.ERROR);
        return next(error);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({message: "Forbidden"});
        req.user = decoded;
        next();
    });
};

module.exports = verifyJWT;