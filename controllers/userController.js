
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const bcryptjs = require("bcryptjs");
const Listing = require("../models/Listing");


const updateUser = asyncHandler(async (req, res) => {
    let {password, username, email, avatar} = req.body;

    if (req.user.id !== req.params.id) {
        const error = appError.create("You Can Only Update Your Own account", 400, httpStatusText.ERROR);
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

    if (password) {
        password = bcryptjs.hashSync(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username,
            password,
            email,
            avatar
        }
    }, {new: true});
    const {password: pwd, ...rest} = updatedUser._doc;
    res.status(200).json(rest);
});


const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id) {
        const error = appError.create("You Can Only delete Your Own account", 401, httpStatusText.ERROR);
        return next(error);
    }
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_Token", {
        httpOnly: true,
        sameSite: "none",
        secure: true
    });
    res.json("User has been Deleted!");
});


const getUserListings = asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id) {
        const error = appError.create("You Can Only View your Own Listings", 400, httpStatusText.ERROR);
        return next(error);
    }
    const listings = await Listing.find({userRef: req.params.id});

    res.json(listings);
});


const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        const error = appError.create("User Not Found !", 409, httpStatusText.FAIL);
        return next(error);
    }
    const {password, ...rest} = user._doc;

    res.json(rest);
});



module.exports = {
    updateUser,
    deleteUser,
    getUserListings,
    getUser
};