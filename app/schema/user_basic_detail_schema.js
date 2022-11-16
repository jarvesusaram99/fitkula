"use strict"

const Joi = require('joi');


class UserBasicSchema {
    ValidateBasicDetail = (lang) => {
        try {
            return Joi.object().keys({
                fullName: Joi.string().regex(/^[A-Za-z \.]+$/).required().messages({
                    "any.required": lang.FULL_NAME_REQ,
                    "string.pattern.base": lang.VALID_FULLNAME,
                }),
                email: Joi.string().min(6).required().email().messages({
                    "any.required": lang.EMAIL_REQ,
                    "string.min": lang.EMAIL_MIN,
                    "string.email": lang.VALID_EMAIL
                }),
                profilePicture: Joi.string().label('image').error((error) => {
                    error[0].message = lang.IMAGE_UPLOAD
                    return errorors[0];
                }),
                dob: Joi.date().raw().required().messages({
                    "any.required": lang.DOB_REQ,
                }),
                deletedFiles: Joi.string(),
                mobile: Joi.string().min(9).max(12).pattern(/^[0-9]+$/).required().messages({
                    "any.required": lang.MOBILE_NO_REQUIRED,
                    "string.pattern.base": lang.VALID_MOBILE_NUMBER,
                    "string.max": lang.MOBILE_NO_MAX,
                    "string.min": lang.MOBILE_NO_MIN,
                }),
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserBasicSchema();