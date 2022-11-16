"use strict"

const Joi = require('joi');


class PartnerServiceSchema {
    ValidatePartnerService = (lang) => {
        try {
            return Joi.object().keys({
                serviceType: Joi.string().required().valid('paid', 'free').messages({
                    "any.required": lang.SERVICE_TYPE_REQ
                }),
                centerName: Joi.string().required().messages({
                    "any.required": lang.CENTER_NAME_REQ
                }),
                serviceFee: Joi.number().required().messages({
                    "any.required": lang.SERVICE_FEE_REQ
                }),
                serviceMode: Joi.number().valid('online', 'offline').required().messages({
                    "any.required": lang.SERVICE_MODE_REQ
                }),
                serviceDesc: Joi.string().required().messages({
                    "any.required": lang.SERVICE_DESCRIPTION_REQ
                }),
                location: Joi.string().required().messages({
                    "any.required": lang.LOCATION_REQ
                }),
                serviceDays: Joi.string().required().messages({
                    "any.required": lang.SERVICE_DAY_REQ
                }),
                serviceName: Joi.string().required().max(36).messages({
                    "any.required": lang.SERVICE_NAME_REQ,
                    "string.max": lang.SERVICE_NAME_LENGTH
                }),
                slots: Joi.string().required().messages({
                    "any.required": lang.SLOTS_REQ
                }),
                coverImageIndex: Joi.string().required().messages({
                    "any.required": lang.COVER_INDEX_REQ
                }),
                currencyLabel: Joi.string().required().messages({
                    "any.required": lang.CURRENCY_LABEL_REQ
                }),
                deletedFiles: Joi.string(),
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PartnerServiceSchema();