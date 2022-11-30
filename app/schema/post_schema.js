"use strict"

const Joi = require('joi');


class PostSchema {
    ValidatePost = (lang) => {
        try {
            return Joi.object().keys({
                description: Joi.string(),
                visibilityPermission: Joi.number().required().messages({
                     "any.required": lang.VISIBILITY_PERMISSION_REQ
                }),
                commentPermssion: Joi.number().valid(0, 1).required().messages({
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