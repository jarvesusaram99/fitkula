"use strict"

const Joi = require('joi');


class ServiceBookingSchema {
    ValidateServiceBooking = (lang) => {
        try {
            return Joi.object().keys({
                serviceId: Joi.string().required().messages({
                    "any.required": lang.SERVICE_ID_REQ
                }),
                paymentStatus: Joi.string().required().messages({
                    "any.required": lang.PAYMENT_STATUS_REQ
                }),
                serviceBookingDate: Joi.string().required().messages({
                    "any.required": lang.SERVICE_BOOKING_DATE_REQ,
                }),
                // paymentIntentId: Joi.string().required().messages({
                //     "any.required": lang.PAYMENT_INTENT_ID_REQ
                // }),
                paymentIntentId: Joi.string(),
                serviceSlot: Joi.string().required().messages({
                    "any.required": lang.SLOTS_REQ
                }),
                status: Joi.string().required().max(35).messages({
                    "any.required": lang.STATUS_REQ,
                }),
                partnerId: Joi.string().required().max(35).messages({
                    "any.required": lang.PARTNER_ID_REQ,
                }),
            })
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ServiceBookingSchema();