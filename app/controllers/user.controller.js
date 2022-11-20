"use strict";
const db = require("../models");
const CONFIG = require("../config/config.js");
const User = db.users;
const jwt = require('jsonwebtoken');
// const FCM = require('fcm-node')
const dotenv = require('dotenv');
// const bcrypt = require('bcrypt');
const { STATUS_CODE } = require("../config/constant");
dotenv.config();
const UserService = require("../service/user.service")
const AWS = require('aws-sdk');
const Message = require("../local/Message");
const { sendError, sendResponse, sendOTP, saveUserOTP } = require("../utills/CommonHelper");
const AuthSchema = require('../schema/auth_schema');
const UserBasicSchema = require('../schema/user_basic_detail_schema');
const SocialLoginSchema = require("../schema/social_login_schema");

AWS.config.update({
    accessKeyId: process.env.AWS_S3_ACCESS,
    secretAccessKey: process.env.AWS_S3_SECRET
});



class UserController {
    signup = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try{
            const {error} = AuthSchema.ValidateSignup(req.lang).validate(req.body);
            if(error){
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await UserService.signupUser(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        }catch(error){
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }



    // Store or update the user on the basis of mobile number and  Send OTP to user
    login = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            //schema - joi
            // const { error } = AuthSchema.ValidatLogin(req.lang).validate(req.body);
            // if (error) {
            //     return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            // }
            const response = await UserService.loginUser(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    };
    


    //Social Login
    socialLogin = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            const { error } = SocialLoginSchema.ValidateSocialLogin(req.lang).validate(req.body);
            if (error) {
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await UserService.loginBySocial(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (err) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }



    // Verify OTP User
    verifyOtp = async (req, res) => {
        try {
            const response = await UserService.userVerifyOtp(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    };



    // Update User Details
    updateUserDetails = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            const { error } = UserBasicSchema.ValidateBasicDetail(req.lang).validate(req.body);
            if (error) {
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await UserService.userUpdateDetails(req)
            return sendResponse(res, response.statusCode, response.status, response.updatedUser, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }



    //Fetching the user Detail
    profile = async (req, res) => {
        try {
            const response = await UserService.getUserDetails(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }



    //Updating user Status
    updateStatus = async (req, res) => {
        try {
            const response = await UserService.updateUserStatus(req)
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)     
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message)
        }
    }


   


    //Get all user
    getAllUser = async (req, res) => {
        try {
            const response = await UserService.findAllUser(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata);
        } catch (err) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }


    getAllPartner = async (req, res) => {
        try {
            const response = await UserService.findAllPartner(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata);
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, error.message);
        }
    }


}



module.exports = new UserController();
