"use strict"

const Joi = require('joi');

class PartnerCenterSchema {
    ValidatePartnerCenter = (lang) => {
        try {
            return Joi.object().keys({
                centerName: Joi.string().required().messages({
                    "any.required": lang.CENTER_NAME_REQ
                }),
                centerTypeId: Joi.string().required().messages({
                    "any.required": lang.CENTER_TYPE_ID_REQ
                }),
                openTime: Joi.string().required().messages({
                    "any.required": lang.CENTER_OPEN_TIME_REQ
                }),
                closeTime: Joi.string().required().messages({
                    "any.required": lang.CENTER_CLOSE_TIME_REQ
                }),
                location: Joi.string().required().messages({
                    "any.required": lang.LOCATION_REQ
                }),
                openingDays: Joi.string().required().messages({
                    "any.required": lang.OPENING_DAYS_REQ
                }),
                facilities: Joi.string().required().max(250).messages({
                    "any.required": lang.FACILITIES_REQ,
                    "string.max" : lang.FACILITIES_MAX_LENGTH
                }),
                description: Joi.string(),
                centerType: Joi.string().required().messages({
                    "any.required": lang.CENTER_TYPE_REQ
                }),
                coverImageIndex: Joi.string().required().messages({
                    "any.required": lang.COVER_INDEX_REQ
                }),
                deletedFiles: Joi.string()
                
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PartnerCenterSchema();