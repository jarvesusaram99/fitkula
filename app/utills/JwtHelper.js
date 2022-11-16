const jwt = require('jsonwebtoken');
const db = require("../models");
// const { sendError } = require('./CommonHelper');
const { STATUS_CODE, AVAIL_LANG } = require('../config/constant');
const Message = require('../local/Message');
const RefreshToken = db.refresh_token;


const { JWT_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE } = require('../config/index');
// const { reject } = require('bcrypt/promises');
// const db = require('../config/db');

class JWTHelper {
    /* To Verify JWT Token */

    /* To Generate JWT Token */
    generateAccessToken = (payload, expireTime, isRefreshToken = false) => {
        try {
            return new Promise((resolve, reject) => {

                if (!payload) {
                    return reject();
                }
                const accessToken = jwt.sign(payload, JWT_TOKEN_SECRET, { expiresIn: "7d" });
                if (isRefreshToken) {
                    const refreshToken = jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET,
                        { expiresIn: "8d" });

                    return resolve(
                        {
                            access_token: accessToken,
                            refresh_token: refreshToken
                        }
                    )
                } else {
                    return resolve({
                        access_token: accessToken
                    })
                }
            })
        } catch (err) {
            throw err;
        }
    }


    /* To Get JWT Token Payload */
    getJWTPayload = async (jwtToken) => {
        try {
            let decodedJwt = jwt.decode(jwtToken, {
                complete: true
            });
            return decodedJwt && decodedJwt.payload ? decodedJwt.payload : null;
        } catch (error) {
            return null;
        }
    }
    /**
     * Verify refresh token
     * @param {*} accessToken
     */
    verifyRefreshToken = (refreshToken) => {
        try {
            return new Promise((resolve, reject) => {
                if (!refreshToken) {
                    return reject("NO_TOKEN_FOUND");
                }
                // verifies secret and checks exp
                jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, function (err, decoded) {
                    if (err) {
                        return reject("INVALID_REFRESH_TOKEN");
                    }
                    resolve(decoded);
                });
            })
        } catch (e) {
            throw e;
        }
    }
    take_refresh_token = async (userId) => {
        try {
            console.log("userId", userId);
            const result = await RefreshToken.findOne({ user_id: userId });
            return result;
        } catch (err) {
            throw err;
        }
    }
}
module.exports = new JWTHelper();