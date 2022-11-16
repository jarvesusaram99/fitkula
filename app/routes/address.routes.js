const AddressController = require("../controllers/address.controller");
const { body, validationResult } = require('express-validator')
var middlewares = require('../middlewares/middlewares.js');
const router = require("express").Router();
var CONFIG = require('../config/config.js');


// Creating User Address
router.post("/", middlewares.authenticateToken, AddressController.createAddress) 

// Deleting User Address
router.delete("/:id",middlewares.authenticateToken, AddressController.deleteAddress)

// Updating User Address
router.put("/:id",middlewares.authenticateToken, AddressController.updateAddress)

// Getting User Address
router.get("/getAddresses",middlewares.authenticateToken, AddressController.getAddresses)



module.exports = router;
