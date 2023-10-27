const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");


router.route("/signup")
    .post(authController.signUp);

router.route("/signin")
    .post(authController.signIn);

router.route("/google")
    .post(authController.google);

router.route("/signout")
    .get(authController.signOut);



module.exports = router;