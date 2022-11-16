const db = require("../models");
const CONFIG = require("../config/config.js");
const AddressService = require("../service/address.service");
const dotenv = require('dotenv');
dotenv.config();
const { sendError, sendResponse } = require("../utills/CommonHelper");
const { STATUS_CODE } = require('../config/constant')
const Message = require("../local/Message");
const AddressSchema = require("../schema/address_schema");




class AddressController {

    // Creating new address of user
    createAddress = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            const { error } = AddressSchema.ValidateAddress(req.lang).validate(req.body);
            if (error) {
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await AddressService.createUserAddress(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }


    // Updating the address of user
    updateAddress = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        const { error } = AddressSchema.ValidateAddress(req.lang).validate(req.body);
        if (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
        }
        try {
            const response = await AddressService.updateUserAddress(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }


    // Deleting the address of the user
    deleteAddress = async (req, res) => {
        try {
            const response = await AddressService.deleteUserAddress(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }


    //Fetching all the address of the user/partner
    getAddresses = async (req, res) => {
        try {
            const response = await AddressService.getUserAddress(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

}


module.exports = new AddressController();
