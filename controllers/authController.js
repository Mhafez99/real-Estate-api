
const User = require("../models/User");
const asyncWrapper = require("../middlewares/asyncWrapper");
const bcryptjs = require("bcryptjs");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const jwt = require("jsonwebtoken");

const signUp = asyncWrapper(async (req, res, next) => {
    const {username, email, password} = req.body;

    if (!username || !password || !email) {
        const error = appError.create("All Fields are Required", 400, httpStatusText.ERROR);
        return next(error);
    }
    const duplicateEmail = await User.findOne({email}).collation({locale: "en", strength: 2}).lean().exec();
    const duplicateUsername = await User.findOne({username}).collation({locale: "en", strength: 2}).lean().exec();

    if (duplicateEmail) {
        const error = appError.create("Email Is Already Exist", 409, httpStatusText.FAIL);
        return next(error);
    }
    if (duplicateUsername) {
        const error = appError.create("Username Is Already Exist", 409, httpStatusText.FAIL);
        return next(error);
    }
    const hashPwd = bcryptjs.hashSync(password, 10);
    const newUser = await User.create({username, "password": hashPwd, email});

    if (newUser) {
        res.status(201).json({message: `New User ${username} created`});
    } else {
        res.status(400).json({message: `Invalid User data received`});
    }
});

const signIn = asyncWrapper(async (req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password) {
        const error = appError.create("All Fields are Required", 400, httpStatusText.ERROR);
        return next(error);
    }

    const foundUser = await User.findOne({email});

    if (!foundUser) {
        const error = appError.create("User not found!", 401, httpStatusText.FAIL);
        return next(error);
    }

    const matchPwd = await bcryptjs.compare(password, foundUser.password);

    if (!matchPwd) {
        const error = appError.create("Wrong credentials!", 401, httpStatusText.FAIL);
        return next(error);
    };

    const token = jwt.sign({id: foundUser._id}, process.env.ACCESS_TOKEN_SECRET);

    const {password: pass, ...rest} = foundUser._doc;

    res.cookie("access_Token", token, {
        httpOnly: true, // Only Accessible by web server
        secure: true, //https
        sameSite: 'none', //cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiration
    });

    res.json(rest);
});

const google = asyncWrapper(async (req, res, next) => {
    const {name, email, photo} = req.body;
    const foundUser = await User.findOne({email}).exec();
    if (foundUser) {
        const token = jwt.sign({id: foundUser._id}, process.env.ACCESS_TOKEN_SECRET);
        const {password: pass, ...rest} = foundUser._doc;
        res.cookie("access_Token", token, {
            httpOnly: true, // Only Accessible by web server
            secure: true, //https
            sameSite: 'none', //cross-site
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiration
        });
        res.json(rest);
    } else {
        const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashPwd = bcryptjs.hashSync(generatePassword, 10);
        const username = name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);
        const newUser = new User({username, email, password: hashPwd, avatar: photo});
        await newUser.save();
        const token = jwt.sign({id: newUser._id}, process.env.ACCESS_TOKEN_SECRET);
        const {password: pass, ...rest} = newUser._doc;
        res.cookie("access_Token", token, {
            httpOnly: true, // Only Accessible by web server
            secure: true, //https
            sameSite: 'none', //cross-site
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiration
        });
        res.status(201).json(rest);
    }
});

const signOut = asyncWrapper(async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies.access_Token) return res.sendStatus(204);
    res.clearCookie("access_Token", {
        httpOnly: true,
        sameSite: "none",
        secure: true
    });
    res.json("User has been Logged out!");
});

module.exports = {
    signUp,
    signIn,
    google,
    signOut
};