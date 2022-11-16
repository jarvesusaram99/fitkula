"use strict"

const Joi = require('joi');


class AuthSchema {
    ValidatLogin = (lang) => {
        try {
            return Joi.object().keys({
                mobile: Joi.string().min(9).max(12).pattern(/^[0-9]+$/).required().messages({
                    "any.required": lang.MOBILE_NO_REQUIRED,
                    "string.max": lang.MOBILE_NO_MAX,
                    "string.min": lang.MOBILE_NO_MIN,
                }),
                role: Joi.string().valid('U', 'P').optional().required().messages({
                    "any.required": lang.ROLE_REQUIRED,
                }),
                countryCode: Joi.string().required().messages({
                    "any.required": lang.COUNTRY_CODE_REQ,
                }),
                loginType: Joi.string().required().messages({
                    "any.required": lang.LOGIN_TYPE_REQ,
                }),
                deviceId: Joi.string().required().messages({
                    "any.required": lang.DEVICE_ID_REQ,
                }),
                deviceType: Joi.string().required().messages({
                    "any.required": lang.DEVICE_TYPE_REQ,
                }),
            })
        } catch (error) {
            throw error;
        }
    }

    ValidateSignup = (lang) =>{
        try{
            return Joi.object({
                userName: Joi.string().min(3).max(12).required().messages({
                    "any.required": lang.USER_NAME_REQ,
                    "string.max": lang.USER_NAME_MAX,
                    "string.min": lang.USER_NAME_MIN,
                }),
                email: Joi.string().min(3).required().email(),
                password: Joi.string().min(3).max(30).required().messages({
                    "string.empty": `Password cannot be empty`,
                    "any.required": `Password is required`,
                })
            })
        }catch(err){
            throw err;
        }
    }
}

module.exports = new AuthSchema();