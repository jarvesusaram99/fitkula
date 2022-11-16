"use strict"

const Joi = require('joi');


class PostSchema {
    ValidatePost = (lang) => {
        try {
            return Joi.object().keys({
                city: Joi.string().required().messages({
                    "any.required": lang.CITY_REQUIRED
                }),
                latitude: Joi.string().required().messages({
                    "any.required": lang.LATITUDE_REQUIRED
                }),
                longitude: Joi.string().required().messages({
                    "any.required": lang.LONGITUDE_REQUIRED
                }),
                description: Joi.string(),
                status: Joi.number().valid(0, 1).required().messages({

                    "any.required": lang.STATUS_REQ
                }),
                visibilityPermission: Joi.number().valid(0, 1).required().messages({
                    "any.required": lang.VISIBILITY_PERMISSION_REQ
                }),
                deletedFiles: Joi.string()
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PostSchema();