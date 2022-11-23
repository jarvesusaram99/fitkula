"use strict"

const Joi = require('joi');


class SocialLoginSchema {
    ValidateSocialLogin = (lang) => {
        try {
            return Joi.object().keys({
                // userName: Joi.string().required().messages({
                //     "any.required": lang.USER_NAME_REQ
                // }),
                email: Joi.string().min(6).email().messages({
                    "string.min": lang.EMAIL_MIN,
                    "string.email": lang.VALID_EMAIL
                }),
                // uid: Joi.string().required().messages({
                //     "any.required": lang.UID_REQ,
                // }),
                mobile: Joi.string(),
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SocialLoginSchema();