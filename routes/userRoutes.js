const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJWT");

router.use(verifyJWT);

router.route("/:id")
    .get(userController.getUser);

router.route("/update/:id")
    .post(userController.updateUser);

router.route("/delete/:id")
    .delete(userController.deleteUser);

router.route("/listings/:id")
    .get(userController.getUserListings);



module.exports = router;