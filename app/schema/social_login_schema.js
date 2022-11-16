"use strict"

const Joi = require('joi');


class SocialLoginSchema {
    ValidateSocialLogin = (lang) => {
        try {
            return Joi.object().keys({
                fullName: Joi.string().required().messages({
                    "any.required": lang.FULL_NAME_REQ
                }),
                email: Joi.string().min(6).required().email().messages({
                    "any.required": lang.EMAIL_REQ,
                    "string.min": lang.EMAIL_MIN,
                    "string.email": lang.VALID_EMAIL
                }),
                role: Joi.string().valid('U', 'P').optional().required().messages({
                    "any.required": lang.ROLE_REQUIRED,
                }),
                uid: Joi.string().required().messages({
                    "any.required": lang.UID_REQ,
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
}

module.exports = new SocialLoginSchema();