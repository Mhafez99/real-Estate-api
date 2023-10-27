const express = require("express");
const listingController = require("../controllers/listingController");
const verifyJWT = require("../middlewares/verifyJWT");

const router = express.Router();


router.route("/create")
    .post(verifyJWT, listingController.createListing);

router.route("/delete/:id")
    .delete(verifyJWT, listingController.deleteListing);

router.route("/update/:id")
    .patch(verifyJWT, listingController.updateListing);

router.route("/get/:id")
    .get(listingController.getOneListing);

router.route("/get")
    .get(listingController.getListings);


module.exports = router;