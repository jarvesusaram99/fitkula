const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const db = require("../models");
// const FCM = require("fcm-node");
// const FCM = require('fcm-notification');
const dotenv = require("dotenv");
const Notifications = db.notifications;
const RefreshToken = db.refresh_token;

// const functions = require('firebase-functions');
// const firebase = require('firebase');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS,
  secretAccessKey: process.env.AWS_S3_SECRET,
});

class CommonHelper {
  sendResponse = (res, statusCode, status, data, message, metaparams) => {
    try {
      res.status(statusCode);
      res.json({
        statusCode: statusCode,
        status: status,
        data: data,
        message: message,
        metaparams: metaparams,
      });
    } catch (error) {
      throw error;
    }
  };


  // Saving user OTP
  saveUserOTP = function (new_user_otp) {
    return new_user_otp.save(function (err, result) {
      if (err) {
        return {
          status: false,
          message:
            err.message || "Something went wrong, please try again later.",
        };
      } else {
        return {
          status: true,
          message: "OTP sent successfully, valid only for 15 Minutes.",
          data: result,
        };
      }
    });
  };


  /* Common error response for all the APIs */
  sendError = (res, statusCode, status, data = {}, msg = "") => {
    try {
      res.status(statusCode);
      res.json({
        statusCode: statusCode,
        status: status,
        data: data,
        message: msg,
      });
    } catch (e) {
      throw e;
    }
  };



  // Saving the user
  saveUser = function (new_user) {
    return new_user.save(function (err, result) {
      if (err) {
        return {
          status: false,
          message:
          err.message || "Something went wrong, please try again later.",
        };
      } else {
        return {
          status: true,
          message: "OTP sent successfully, valid only for 15 Minutes.",
          data: result,
        };
      }
    });
  };



  // Saving the OTP
  sendOTP = async function (userMobile, OTP) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    const twilioBody = {
      to: userMobile,
      // from: "+14154133170",
      from: "+13344876649",
      body: "Your Autism OTP is: " + OTP,
    };
    let response = client.messages.create(twilioBody, function (error, message) {
      if (error) {
        return {
          status: false,
          message: error.message
        }
      } else {
        return {
          status: true,
          message: message.sid
        }
      }
    });
    return response;
  }

  saveRefreshToken = async (user_id, refresh_token) => {
    try {
      const result = await RefreshToken.findOneAndUpdate(
        {
          user_id: user_id,
        },
        { $set: { refresh_token : refresh_token}},
        { upsert: true, useFindAndModify: false, returnNewDocument : true  }
      );
      if (result) {
        // return true;
      } else {
        const newToken = await new RefreshToken({
          user_id: user_id,
          refresh_token: refresh_token,
        });
        const response = newToken.save();
        // return response;
      }
    } catch (err) {
      throw err;
    }
  };


  convertCase = (key) => {
    let newKey = key.split("_").map((part) => {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });
    let newNewKey = newKey.join("");
    return newNewKey.charAt(0).toLowerCase() + newNewKey.slice(1);
  };


  // Validating service timings with center
  validateSlots = async (slots) => {
    let valid_service_slots = slots.split(':')
    valid_service_slots = valid_service_slots.concat(valid_service_slots[1].split(' '))
    valid_service_slots.splice(1, 1)
    if (valid_service_slots[2] === 'AM') {
      valid_service_slots.splice(2, 1)
      valid_service_slots = valid_service_slots.map((time) => {
        return parseInt(time)
      })
      valid_service_slots = parseInt(valid_service_slots[0]) + parseInt(valid_service_slots[1]) / 60
      return valid_service_slots
    }
    else {
      valid_service_slots.splice(2, 1)
      if(valid_service_slots[0] == 12 ){
        return 12;
      }
      valid_service_slots = valid_service_slots.map((time) => {
        return parseInt(time)
      })
      valid_service_slots = 12 + parseInt(valid_service_slots[0]) + parseInt(valid_service_slots[1]) / 60
      return valid_service_slots
    }
  }



  formatResp = (myObj) => {
    console.log("Inside formatResp", myObj);
    let toReturn = {};
    for (const key in myObj) {
      console.log(`${key}`);
      let myNewKey = this.convertCase(key);
      toReturn[myNewKey] = myObj[key];
    }
    console.log("The value of toReturn is:", toReturn);
    return toReturn;
  };



  //Checking the file type
  checkFileType = async (myFiles) => {
    let checkMyFile = [];
    const maxSize = 10485760; // File size must be less than 10mb
    if (!Array.isArray(myFiles)) {
      checkMyFile.push(myFiles);
    } else {
      checkMyFile = myFiles;
    }
    checkMyFile = checkMyFile.map((file) => {
      const myFileType = file.name.split(".");
      if (
        (myFileType[myFileType.length - 1] === "jpg" ||
          myFileType[myFileType.length - 1] === "png" ||
          myFileType[myFileType.length - 1] === "jpeg") &&
        file.size < maxSize
      ) {
        return true;
      } else {
        return false;
      }
    });
    return checkMyFile;
  };

  // Uploading file in S3
  uploadFile = async (fileContent, name, folderName, myId) => {
    return new Promise((resolve) => {
      // convert binary data to base64 encoded string
      var params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Body: fileContent,
        Key: `${folderName}/` + `${myId}/` + new Date().getTime() + "_" + name
      };

      s3.upload(params, function (err, data) {
        //handle error
        if (err) {
          console.log("Error", err);
        }
        //success
        if (data) {
          console.log("Uploaded in:", data.Location);
          resolve(data.Location);
        }
      });
    });
  };

  //Delete File from s3
  deleteFile = async (folderName, myId, deletedFiles) => {
    return new Promise((resolve) => {
      deletedFiles.forEach((file) => {
        // convert binary data to base64 encoded string
        var params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${folderName}/` + `${myId}/` + file,
        };
        s3.deleteObject(params, function (err, data) {
          //handle error
          if (err) {
            console.log("Error", err);
          }
          //success
          if (data) {
            resolve(data.Location);
          }
        });
      });
    });
  };

  // Convert a number to n decimal places
  convertToDecimalPlaces = async (number, n) => {
    number = parseInt(number).toFixed(n);
    return number;
  };

 // Push Notification
  // sendPushNotifications(notificationDetail) {
  //   if (notificationDetail.users && notificationDetail.users.length) {
  //     let serverKey = process.env.FCM_KEY;
  //     notificationDetail.users.forEach((userObj) => {
  //       let notiObj = {};
  //       notiObj.user_id = userObj._id;
  //       notiObj.notification_type = notificationDetail.noti_type;
  //       notiObj.notification_msg = notificationDetail.noti_message;
  //       notiObj.booking_id = notificationDetail.booking_id;
  //       notiObj.service_id = notificationDetail.service_id;
  //       notiObj.post_id = notificationDetail.post_id;
  //       notiObj.following_id = notificationDetail.following_id;
  //       notiObj.followed_by = notificationDetail.followed_by;
  //       notiObj.commented_by = notificationDetail.commented_by;
  //       notiObj.liked_by = notificationDetail.liked_by;
  //       notiObj.cancled_by = notificationDetail.cancled_by;
  //       notiObj.image = notificationDetail.image;
  //       var fcm = new FCM(serverKey);
  //       var message = {
  //         //this may vary according to the message type (single recipient, multicast, topic, et cetera)
  //         to: `/topics/${userObj._id}`,
  //         notification: {
  //           title: notificationDetail.noti_type,
  //           body: notificationDetail.noti_message,
  //           // image: image_url
  //         },
  //         //data: { data: data }
  //       };
  //       fcm.send(message, function (err, response) {
  //         if (err) {
  //           notiObj.status = 0;
  //           console.log("Something has gone wrong!", err);
  //         } else {
  //           notiObj.status = 1;
  //           console.log("Successfully sent with response: ", response);
  //         }
  //         let notiModel = new Notifications(notiObj);
  //         notiModel.save();
  //       });
  //     });
  //   }
  // }
}

module.exports = new CommonHelper();
