
const UserController = require("../controllers/user.controller.js");
const { body, validationResult } = require('express-validator')
var router = require("express").Router();
var middlewares = require('../middlewares/middlewares.js');
var CONFIG = require('../config/config.js');
const userController = require("../controllers/user.controller.js");



//signup user
router.post('/signup',userController.signup);

// Create a new User
router.post("/login", UserController.login);



// Login Social Login
router.post("/sociallogin", UserController.socialLogin);
// router.get("/allUser", middlewares.authenticateToken, UserController.getAllUser);
// router.get("/allPartner", middlewares.authenticateToken, UserController.getAllPartner);



//Vefify User OTP
router.post("/verifyOtp", UserController.verifyOtp);


// Update Basic details of user
router.post("/updateUserDetails", middlewares.authenticateToken, UserController.updateUserDetails);

//Fetching user details
router.get("/profile/:id", middlewares.authenticateToken, UserController.profile);



module.exports = router;
