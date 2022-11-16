"use strict"

const Joi = require('joi');


class ProfessionalDetailsSchema {
    ValidateProfessionalDetails = (lang) => {
        try {
            return Joi.object().keys({
                instituteName: Joi.string().required().messages({
                    "any.required": lang.INSTITUTE_REQUIRED
                }),
                instituteType: Joi.string().required().messages({
                    "any.required": lang.INSTITUTE_TYPE_REQUIRED
                }),
                licenceNumber: Joi.string().required().alphanum().messages({
                    "any.required": lang.LICENCE_REQUIRED,
                    "string.alphanum": lang.LICENCE_ALPHANUM
                }),
                startDate: Joi.string().required().messages({
                    "any.required": lang.START_DATE_REQUIRED   
                }),
                endDate: Joi.string().required().messages({
                    "any.required": lang.END_DATE_REQUIRED
                }),
                experience: Joi.number().required().max(35).messages({
                    "any.required": lang.EXPERIENCE_REQUIRED,
                    "number.max": lang.MAX_EXPERIENCE,
                    
                }),
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ProfessionalDetailsSchema();