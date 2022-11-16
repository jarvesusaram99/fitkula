"use strict"

const Joi = require('joi');


class PostRepostSchema {
    ValidatePostRepost = (lang) => {
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
                parentPostId: Joi.string().required().messages({
                    "any.required": lang.PARENT_POST_ID_REQ
                })
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PostRepostSchema();