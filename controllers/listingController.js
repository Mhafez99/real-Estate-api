const asyncWrapper = require("../middlewares/asyncWrapper");
const Listing = require("../models/Listing");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const createListing = asyncWrapper(async (req, res, next) => {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
});

const deleteListing = asyncWrapper(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        const error = appError.create("Listing Not Found", 404, httpStatusText.ERROR);
        return next(error);
    }
    if (req.user.id !== listing.userRef) {
        const error = appError.create("You Can Only delete your own Listings!", 400, httpStatusText.ERROR);
        return next(error);
    }
    await Listing.findByIdAndDelete(req.params.id);
    return res.json("Lisitng has been deleted!");
});

const updateListing = asyncWrapper(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        const error = appError.create("Listing Not Found", 404, httpStatusText.ERROR);
        return next(error);
    }
    if (req.user.id !== listing.userRef) {
        const error = appError.create("You Can Only delete your own Listings!", 400, httpStatusText.ERROR);
        return next(error);
    }
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {new: true});
    return res.json(updatedListing);
});

const getOneListing = asyncWrapper(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        const error = appError.create("Listing Not Found", 404, httpStatusText.ERROR);
        return next(error);
    }
    return res.json(listing);
});

const getListings = asyncWrapper(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;

    if (offer === undefined || offer === false) {
        offer = {$in: [false, true]};
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === false) {
        furnished = {$in: [false, true]};
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === false) {
        parking = {$in: [false, true]};
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
        type = {$in: ['sale', 'rent']};
    }

    const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const listings = await Listing.find({
        name: {$regex: searchTerm, $options: "i"},
        offer,
        furnished,
        parking,
        type
    })
        .sort({
            [sort]: order
        })
        .limit(limit)
        .skip(startIndex);

    return res.json(listings);
});

module.exports = {
    createListing,
    deleteListing,
    updateListing,
    getOneListing,
    getListings
};