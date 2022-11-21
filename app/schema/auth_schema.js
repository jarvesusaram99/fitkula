"use strict"

const Joi = require('joi');


class AuthSchema {
    ValidatLogin = (lang) => {
        try {
            return Joi.object().keys({
                email: Joi.string().min(6).required().email().message('Must be a valid email address'),
                password: Joi.string().required().min(6).message('Password is required!'),
            })
        } catch (error) {
            throw error;
        }
    }

    ValidateSignup = (lang) =>{
        try{
            return Joi.object({
                userName: Joi.string().min(3).max(12).required().messages({
                    "any.required": lang.USER_NAME_REQ,
                    "string.max": lang.USER_NAME_MAX,
                    "string.min": lang.USER_NAME_MIN,
                }),
                email: Joi.string().min(3).required().email(),
                password: Joi.string().min(3).max(30).required().messages({
                    "string.empty": `Password cannot be empty`,
                    "any.required": `Password is required`,
                })
            })
        }catch(err){
            throw err;
        }
    }
}

module.exports = new AuthSchema();