"use strict"

const Joi = require('joi');


class AddressSchema {
    ValidateAddress = (lang) => {
        try {
            return Joi.object().keys({
                addressLine_1: Joi.string().required().messages({
                    "any.required": lang.ADDRESS_LINE_1
                }),
                addressLine_2: Joi.string().required().messages({
                    "any.required": lang.ADDRESS_LINE_2
                }),
                landmark: Joi.string(),
                latitude: Joi.string().required().messages({
                    "any.required": lang.LATITUDE_REQUIRED
                }),
                longitude: Joi.string().required().messages({
                    "any.required": lang.LONGITUDE_REQUIRED
                }),
                city: Joi.string().required().messages({
                    "any.required": lang.CITY_REQUIRED
                }),
                is_default: Joi.number().optional()  
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AddressSchema();