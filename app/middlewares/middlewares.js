const fs = require('fs');
const path = require('path');
const CONFIG = require('../config/config.js');
const db = require("../models");
const User = db.users;
const { STATUS_CODE } = require("../config/constant");
const { sendError } = require("../utills/CommonHelper");
const Message = require("../local/Message");
const { JWT_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE } = require('../config/index');

const jwt = require('jsonwebtoken');

function authenticateToken (req, res, next) {
  let lang = Message["en"];
  req.lang = lang;
  const { NOT_ACTIVE} = req.lang;

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]
  if (token === null){
    res.status(401).send({ status: 401, message: "Bad request" })
  }
  jwt.verify(token, JWT_TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).send({
        statusCode: 403,
        message: "Access token expired!"
      })
    } 
      req.user = user
      req.token = token
      const userStatus = await User.find({_id: user.id});
      if(userStatus.length){
        if(userStatus[0].status === 0){
          return res.status(403).send({
            statusCode: STATUS_CODE.HTTP_403_FORBIDDEN,
            logout:true,
            message:NOT_ACTIVE
          })
        }
      }
      next()
  })
}


function userRoleAuthentication(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    res.status(401).send({ status: 401, message: "Bad request" })
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    if (user.user.role == "U") {
      req.user = user;
      next();
    }
    else {
      return res.sendStatus(401)
    }
  })
}


function partnerRoleAuthentication(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    res.status(401).send({ status: 401, message: "Bad request" })
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    if (user.role == "P") {
      req.user = user;
      next();
    }
    else {
      return res.sendStatus(401)
    }
  })
}




function adminAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {


    if (err) return res.sendStatus(403)

    if (user.role == "A") {
      req.user = user;
      next();
    } else {
      return res.sendStatus(401)
    }

  })
}




module.exports = {
  authenticateToken,
  adminAuthenticateToken,
  userRoleAuthentication,
  partnerRoleAuthentication,

};
