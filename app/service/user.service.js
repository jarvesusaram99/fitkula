const db = require("../models");
const bcrypt = require('bcrypt');
const User = db.users;
const UserOtp = db.user_otp;
const Address = db.address;
const PartnerService = db.partner_service;
const PartnerCenter = db.partner_center;
const ProfessionalDetails = db.professional_details;
const mongoose = require("mongoose");
const { STATUS_CODE } = require("../config/constant");
const ServiceBooking = db.service_bookings;
const Followers = db.user_followers;
const {
  saveUserOTP,
  saveUser,
  uploadFile,
  deleteFile,
  checkFileType,
  sendOTP,
} = require("../utills/CommonHelper");

const Message = require("../local/Message");
const RefreshToken = db.refresh_token;
const { TOKEN_LIFE } = require("../config/index");
const { generateAccessToken } = require("../utills/JwtHelper");
const { saveRefreshToken } = require("../utills/CommonHelper");

class UserServices {

  //signup user
  signupUser = async (req) =>{
    let lang = Message["en"];
    req.lang = lang;
    const { NOT_ACTIVE, SEND_OTP_SUCCESSFULLY, USER_NOT_FOUND, SIGNUP_SUCCESSFULLY } = req.lang;
    const {userName, email, password} = req.body;
    try{
      const user = await User.findOne({email: email});
      if(!user){
        let bcryptPassword = bcrypt.hashSync(password, 10);
        const myData = new User({
          username: userName,
          email: email,
          password: bcryptPassword
        })
        myData.save()
        return {
            statusCode: STATUS_CODE.HTTP_200_OK,
            status: true,
            response: {},
            message: SIGNUP_SUCCESSFULLY,
            metadata: [],
          };
      }else{
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
          response: {},
          message: "You are already registered.",
          metadata: [],
        }
      }
    }catch(error){
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      }
    }
  }


  loginUser = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { NOT_ACTIVE, LOGIN_SUCCESSFULLY, USER_NOT_FOUND } = req.lang;
    // let OTP = process.env.OTP_DEV;
    const { email, password} = req.body;
    
    try {
      // let OTP
      // do {
      //     OTP = Math.floor(100000 + Math.random() * 900000)
      // }
      // while (OTP.toString().length !== 6)
      let user = await User.findOne({ email });

      if (!user) {
        console.log("hello");
          return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: USER_NOT_FOUND,
          metadata: [],
        };
      } else {
        const matchedPassword = bcrypt.compareSync(password, user.password);
        if(matchedPassword === false){
          return {
            statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
            status: false,
            response: {},
            message: "Please enter currect password.",
            metadata: [],
          };
        }
        if (user.status === 0) {
          return {
            statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
            status: false,
            response: {},
            message: NOT_ACTIVE,
            metadata: [],
          };
        } else {
          let payload = {
            email: user.email,
            id: user._id,
          };
          let Token = await generateAccessToken(payload, TOKEN_LIFE, true);
          return {
            statusCode: STATUS_CODE.HTTP_200_OK,
            status: true,
            response: {
              user: {
                email: user.email,
                userName: user.username
              },
              token: Token
            },
            message: LOGIN_SUCCESSFULLY,
            metadata: [],
          };
        }
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  //User login by Social media
  loginBySocial = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { LOGIN_SUCCESSFULLY } = req.lang;
    const { uid, userName, email, mobile } =
      req.body;
    try {
      let user = await User.findOne({ email });
      // let OTP = process.env.OTP_DEV;
      if (!user) {
        user = new User({
          username: userName,
          email: email,
          mobile: mobile,
          uid,
        });
        await saveUser(user);

        // const new_user_otp = new UserOtp({ otp: OTP, user_id: user._id }); //Creating the user otp object
        // await saveUserOTP(new_user_otp); //Saving the user otp object
      }
      let payload = {
        email: user.email,
        id: user._id,
      };
      let Token = await generateAccessToken(payload, TOKEN_LIFE, true);
      Token.user_id = user._id;
      Token.email = user.email;
      if (Token.user_id && Token.refresh_token) {
        await saveRefreshToken(Token.user_id, Token.refresh_token);
      }
      return {
        statusCode: STATUS_CODE.HTTP_200_OK,
        status: true,
        response: {
          user: {
            fullname: user.fullname,
            email: user.email,
            mobile: user.mobile,
            status: user.status,
            is_verified: user.is_verified,
            _id: user._id,
          },
          accessToken: Token.access_token,
          refreshToken: Token.refresh_token,
        },
        message: LOGIN_SUCCESSFULLY,
        metadata: [],
      };
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  userVerifyOtp = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { OTP_EXPIRED, OTP_VERIFIED, NOT_VALID_OTP } = req.lang;
    const { mobile, otp } = req.body;
    try {
      let user = await User.findOne({ mobile: mobile });
      if (user) {
        let new_user_otp = await UserOtp.findOne({
          user_id: user._id,
        }).populate({
          path: "user_id",
          select: "fullname mobile email status is_verified",
          model: User,
        });
        let updatedTime = Date.parse(new_user_otp.updatedAt) + 15 * 60 * 1000;
        let currentTime = new Date(new Date().toISOString()).getTime();
        if (currentTime > updatedTime) {
          return {
            statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
            status: false,
            response: {},
            message: OTP_EXPIRED,
            metadata: [],
          };
        } else {
          if (otp === new_user_otp.otp) {
            let payload = {
              mobile_no: user.mobile,
              id: user._id,
            };
            let Token = await generateAccessToken(payload, TOKEN_LIFE, true);
            Token.user_id = user._id;
            Token.mobile_no = user.mobile;
            if (Token.user_id && Token.refresh_token) {
              await saveRefreshToken(Token.user_id, Token.refresh_token);
            }
            return {
              statusCode: STATUS_CODE.HTTP_200_OK,
              status: true,
              response: {
                user: {
                  fullname: user.fullname,
                  email: user.email,
                  mobile: user.mobile,
                  status: user.status,
                  is_verified: user.is_verified,
                  _id: user._id,
                },
                accessToken: Token.access_token,
                refreshToken: Token.refresh_token,
              },
              message: OTP_VERIFIED,
              metadata: [],
            };
          } else {
            return {
              statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
              status: false,
              response: {},
              message: NOT_VALID_OTP,
              metadata: [],
            };
          }
        }
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  //Update User Basic detail
  userUpdateDetails = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const {
      BASIC_DETAILS_UPDATED,
      UPLOAD_VALID_FILE,
      MOBILE_USER_EXIT,
      EMAIL_USER_EXIST,
    } = req.lang;
    const { fullName, email, mobile, dob } = req.body;
    try {
      let mobileNum = await User.findOne({
        $and: [{ mobile }, { _id: { $ne: req.user.id } }],
      });
      let emailAdd = await User.findOne({
        $and: [{ email }, { _id: { $ne: req.user.id } }],
      });
      let updatedUser = {};
      if (mobileNum) {
        return {
          statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
          status: false,
          updatedUser,
          message: MOBILE_USER_EXIT,
          metadata: [],
        };
      } else if (emailAdd) {
        return {
          statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
          status: false,
          updatedUser,
          message: EMAIL_USER_EXIST,
          metadata: [],
        };
      } else {
        let uploadedImage;
        let myDeletedFiles = [];
        const folderName = "profile_pictures";
        const myId = req.user.id;
        let update_user = {
          fullname: fullName,
          email,
          mobile,
          date_of_birth: dob,
        };
        if (req.files) {
          const { profilePicture } = req.files;
          const myFileType = await checkFileType(profilePicture);
          if (myFileType.includes(false)) {
            return {
              statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
              status: false,
              updatedUser,
              message: UPLOAD_VALID_FILE,
              metadata: [],
            };
          } else {
            const fileContent = req.files.profilePicture.data;
            const name = req.files.profilePicture.name;
            uploadedImage = await uploadFile(
              fileContent,
              name,
              folderName,
              myId
            );
            update_user.image = uploadedImage;
          }
        }
        if (req.body.deletedFiles) {
          const { deletedFiles } = req.body;
          myDeletedFiles.push(deletedFiles);
          myDeletedFiles = myDeletedFiles.map((file) => {
            let myArray = file.split("/");
            return myArray[myArray.length - 1];
          });
          await deleteFile(folderName, myId, myDeletedFiles);
        }
        updatedUser = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: update_user },
          { new: true }
        );
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          updatedUser,
          message: BASIC_DETAILS_UPDATED,
          metadata: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  getUserDetails = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { USER_FETCHED, USER_NOT_FETCHED } = req.lang;
    const { id } = req.params;
    try {
      let user = await User.findOne({ _id: id });
      let isFollowed = false;
      if (user) {
        const address = await Address.find({ user_id: id });
        if (user.role === "P") {
          const center = await PartnerCenter.find({ user_id: id });
          const professionalDetail = await ProfessionalDetails.find({
            user_id: user._id,
          });
          const services = await PartnerService.find({ user_id: id });
          return {
            statusCode: STATUS_CODE.HTTP_200_OK,
            status: true,
            response: {
              user,
              services,
              address,
              center,
              professionalDetail,
            },
            message: USER_FETCHED,
            metadata: [],
          };
        } else {
          const follower = await Followers.find({
            $and: [{ user_id: req.user.id }, { following_id: id }],
          });
          if (follower.length) {
            isFollowed = true;
          }
          return {
            statusCode: STATUS_CODE.HTTP_200_OK,
            status: true,
            response: {
              user,
              isFollowed,
              address,
            },
            message: USER_FETCHED,
            metadata: [],
          };
        }
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: USER_NOT_FETCHED,
          metadata: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  //Get All users
  findAllUser = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { USERS_NOT_FOUND, USER_FETCHED } = req.lang;
    try {
      let keyword = "";
      if (req.query.keyword) {
        keyword = req.query.keyword;
      }
      // let keyword  = req.query.keyword
      const page = parseInt(req.query.page);
      let limit = parseInt(process.env.PAGE_LIMIT);
      const users = await User.find({
        $and: [{ role: "U" }, { fullname: { $regex: keyword, $options: "i" } }],
      })
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip(limit * page - limit)
        .limit(limit);
      if (users.length) {
        const total_count = await User.find({
          $and: [
            { role: "U" },
            { fullname: { $regex: keyword, $options: "i" } },
          ],
        }).countDocuments();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};
        let prev_page;
        let next_page;
        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit,
          };
        }
        if (endIndex < total_count) {
          results.next = {
            page: page + 1,
            limit: limit,
          };
        }
        const count = users.length;
        const totalPages = Math.ceil(total_count / limit);
        const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
        const per_page = limit;
        if (totalPages === currentPage) {
          next_page = null;
        } else {
          next_page = results.next.page;
        }
        if (currentPage === 1) {
          prev_page = null;
        } else {
          prev_page = results.previous.page;
        }
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: {
            users,
            paginationData: {
              count,
              total_count,
              totalPages,
              currentPage,
              prev_page,
              next_page,
            },
          },
          message: USER_FETCHED,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: {},
          message: USERS_NOT_FOUND,
          metadata: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  //find all partner
  findAllPartner = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { PARTNERS_FETCHED, PARTNERS_NOT_FOUND } = req.lang;
    try {
      let keyword = "";
      if (req.query.keyword) {
        keyword = req.query.keyword;
      }

      let filteredPartenr = [];

      const page = parseInt(req.query.page);
      let limit = parseInt(process.env.PAGE_LIMIT);
      let partners = await User.aggregate([
        {
          $match: {
            $and: [
              { is_verified: 1 },
              { role: "P" },
              // { status: 1 },
              { fullname: { $regex: keyword, $options: "i" } },
            ],
          },
        },

        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "user_id",
            as: "addresses",
          },
        },

        {
          $lookup: {
            from: "partner_centers",
            localField: "_id",
            foreignField: "user_id",
            as: "partner_center",
          },
        },
      ]);
      // .sort({ createdAt: -1, updatedAt: -1 })
      // .skip((limit * page) - limit)
      // .limit(limit);
      if (partners.length) {
        partners.filter((item) => {
          let addressLat = parseInt(req.query.lat);
          let addressLon = parseInt(req.query.lon);
          let postLat = parseInt(item.addresses[0].latitude);
          let postLon = parseInt(item.addresses[0].longitude);
          let R = 6371; // Radius of the earth in km
          let dLat = deg2rad(postLat - addressLat); // deg2rad below
          let dLon = deg2rad(postLon - addressLon);
          let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(addressLat)) *
              Math.cos(deg2rad(postLat)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          // let d = R * c; // Distance in km
          let distance = calcDistance(addressLat, addressLon, postLat, postLon);

          filteredPartenr.push({ item, distance });

          return filteredPartenr;
        });

        function calcDistance(addressLat, addressLon, postLat, postLon) {
          var radlat1 = (Math.PI * addressLat) / 180;
          var radlat2 = (Math.PI * postLat) / 180;
          var theta = addressLon - postLon;
          var radtheta = (Math.PI * theta) / 180;
          var dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist);
          dist = (dist * 180) / Math.PI;
          dist = dist * 60 * 1.1515;
          dist = dist * 1.609344;

          return dist;
        }

        function deg2rad(deg) {
          return deg * (Math.PI / 180);
        }
        filteredPartenr.sort(function (a, b) {
          var origLat = req.query.lat,
            origLong = req.query.lon;

          return (
            calcDistance(
              origLat,
              origLong,
              a.item.addresses[0].latitude,
              a.item.addresses[0].longitude
            ) -
            calcDistance(
              origLat,
              origLong,
              b.item.addresses[0].latitude,
              b.item.addresses[0].longitude
            )
          );
        });

        const total_count = await User.find({
          $and: [
            { is_verified: 1 },
            { role: "P" },
            { fullname: { $regex: keyword, $options: "i" } },
          ],
        }).countDocuments();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};
        let prev_page;
        let next_page;
        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit,
          };
        }
        if (endIndex < total_count) {
          results.next = {
            page: page + 1,
            limit: limit,
          };
        }

        const count = partners.length;
        const totalPages = Math.ceil(total_count / limit);
        const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
        const per_page = limit;
        if (totalPages === currentPage) {
          next_page = null;
        } else {
          next_page = results.next.page;
        }
        if (currentPage === 1) {
          prev_page = null;
        } else {
          prev_page = results.previous.page;
        }
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: {
            filteredPartenr,
            paginationData: {
              count,
              total_count,
              totalPages,
              currentPage,
              prev_page,
              next_page,
            },
          },
          message: PARTNERS_FETCHED,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: {},
          message: PARTNERS_NOT_FOUND,
          metadata: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  updateUserStatus = async (req) => {
    try {
      let lang = Message["en"];
      req.lang = lang;
      const { STATUS_UPDATED, NO_USER } = req.lang;
      const { id } = req.params;
      let user = await User.findOne({ _id: id });
      if (user) {
        if (user.status === 1) {
          user = await User.findOneAndUpdate(
            { _id: id },
            { $set: { status: 0 } },
            { new: true }
          );
        } else {
          user = await User.findOneAndUpdate(
            { _id: id },
            { $set: { status: 1 } },
            { new: true }
          );
        }
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: user,
          message: STATUS_UPDATED,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: NO_USER,
          metadata: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  allUpdates = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { DATA_RETRIEVED_SUCCESSFULLY } = req.lang;
    try {
      let response = {
        upcoming_booking: {},
        cancelled_booking: {},
        revenue: {},
      };
      let today_date = new Date().toISOString().split("T");
      let startFrom = "T00:00:00.000Z";
      let endTo = "T23:59:59.999Z";
      let month_date = today_date[0].split("-");
      month_date[2] = "01";
      month_date = month_date.join("-");

      // Finding total Revenue of Today (One day)
      let todayRevenue = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(today_date[0] + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
          },
        },
      ]);

      if (todayRevenue.length) {
        response.revenue.today = todayRevenue[0].total_amount;
      } else {
        response.revenue.today = 0;
      }

      // Finding total Revenue of Month (Current Month)
      let monthlyRevenue = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(month_date + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            COUNT: {
              $sum: 1,
            },
          },
        },
      ]);
      if (monthlyRevenue.length) {
        response.revenue.month = monthlyRevenue[0].total_amount;
      } else {
        response.revenue.month = 0;
      }

      // Finding Total Revenue Till Date
      let totalRevenue = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $lte: new Date(today_date[0] + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            COUNT: {
              $sum: 1,
            },
          },
        },
      ]);

      if (monthlyRevenue.length) {
        response.revenue.total = totalRevenue[0].total_amount;
      } else {
        response.revenue.total = 0;
      }

      // Finding Total Upcoming Bookings of Today (One day)
      let todayUpcomingBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(today_date[0] + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "U",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (todayUpcomingBookings.length) {
        response.upcoming_booking.today = todayUpcomingBookings[0].count;
      } else {
        response.upcoming_booking.today = 0;
      }

      // Finding total Upcoming Bookings of Month (Current Month)
      let monthlyUpcomingBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(month_date + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "U",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      if (monthlyUpcomingBookings.length) {
        response.upcoming_booking.month = monthlyUpcomingBookings[0].count;
      } else {
        response.upcoming_booking.month = 0;
      }

      //Finding Total Upcoming Bookings Till Date
      let totalUpcomingBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $lte: new Date(today_date[0] + endTo),
            },
            status: "U",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (totalUpcomingBookings.length) {
        response.upcoming_booking.total = totalUpcomingBookings[0].count;
      } else {
        response.upcoming_booking.total = 0;
      }

      // Finding Total Cancelled Bookings of Today (One day)
      let todayCancelledBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            updatedAt: {
              $gte: new Date(today_date[0] + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "Can",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (todayCancelledBookings.length) {
        response.cancelled_booking.today = todayCancelledBookings[0].count;
      } else {
        response.cancelled_booking.today = 0;
      }

      // Finding total Cancelled Bookings of Month (Current Month)
      let monthlyCancelledBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            updatedAt: {
              $gte: new Date(month_date + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "Can",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      if (monthlyCancelledBookings.length) {
        response.cancelled_booking.month = monthlyCancelledBookings[0].count;
      } else {
        response.cancelled_booking.month = 0;
      }

      // Finding Total Cancelled Bookings Till Date
      let totalCancelledBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            updatedAt: {
              $lte: new Date(today_date[0] + endTo),
            },
            status: "Can",
          },
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (totalCancelledBookings.length) {
        response.cancelled_booking.total = totalCancelledBookings[0].count;
      } else {
        response.cancelled_booking.total = 0;
      }
      return {
        statusCode: STATUS_CODE.HTTP_200_OK,
        status: true,
        response: response,
        message: DATA_RETRIEVED_SUCCESSFULLY,
        metadata: [],
      };
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };

  partnerServiceBookingUpdates = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { DATA_RETRIEVED_SUCCESSFULLY } = req.lang;
    try {
      let response = {};
      let today_date = new Date().toISOString().split("T");
      let startFrom = "T00:00:00.000Z";
      let endTo = "T23:59:59.999Z";
      let first_month = today_date[0].split("-");
      first_month[2] = "01";
      first_month = first_month.join("-");

      // Finding total completed booking of first month
      let firstMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(first_month + startFrom),
              $lte: new Date(today_date[0] + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      if (firstMonthBookings.length) {
        response.first_month = firstMonthBookings[0].count;
      } else {
        response.first_month = 0;
      }

      // Finding total completed booking of second month
      let second_month = first_month;
      second_month = second_month.split("-");
      second_month[1] = "0" + (second_month[1] - 1);
      second_month = second_month.join("-");
      let secondMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(second_month + startFrom),
              $lte: new Date(first_month + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (secondMonthBookings.length) {
        response.second_month = secondMonthBookings[0].count;
      } else {
        response.second_month = 0;
      }

      // Finding total completed booking of third month
      let third_month = second_month;
      third_month = third_month.split("-");
      third_month[1] = "0" + (third_month[1] - 1);
      third_month = third_month.join("-");
      let thirdMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(third_month + startFrom),
              $lte: new Date(second_month + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (thirdMonthBookings.length) {
        response.third_month = thirdMonthBookings[0].count;
      } else {
        response.third_month = 0;
      }

      // Finding total completed booking of fourth month
      let fourth_month = third_month;
      fourth_month = fourth_month.split("-");
      fourth_month[1] = "0" + (fourth_month[1] - 1);
      fourth_month = fourth_month.join("-");
      let fourthMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(fourth_month + startFrom),
              $lte: new Date(third_month + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (fourthMonthBookings.length) {
        response.fourth_month = fourthMonthBookings[0].count;
      } else {
        response.fourth_month = 0;
      }

      // Finding total completed booking of fifth month
      let fifth_month = fourth_month;
      fifth_month = fifth_month.split("-");
      fifth_month[1] = "0" + (fifth_month[1] - 1);
      fifth_month = fifth_month.join("-");
      let fifthMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(fifth_month + startFrom),
              $lte: new Date(fourth_month + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (fifthMonthBookings.length) {
        response.fifth_month = fifthMonthBookings[0].count;
      } else {
        response.fifth_month = 0;
      }

      // Finding total completed booking of sixth month
      let sixth_month = fifth_month;
      sixth_month = sixth_month.split("-");
      sixth_month[1] = "0" + (sixth_month[1] - 1);
      sixth_month = sixth_month.join("-");
      let sixthMonthBookings = await ServiceBooking.aggregate([
        {
          $match: {
            partner_id: mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(sixth_month + startFrom),
              $lte: new Date(fifth_month + endTo),
            },
            status: "C",
          },
        },
        {
          $group: {
            _id: null,

            total_amount: {
              $sum: "$total_amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      if (sixthMonthBookings.length) {
        response.sixth_month = sixthMonthBookings[0].count;
      } else {
        response.sixth_month = 0;
      }
      return {
        statusCode: STATUS_CODE.HTTP_200_OK,
        status: true,
        response: response,
        message: DATA_RETRIEVED_SUCCESSFULLY,
        metadata: [],
      };
    } catch (error) {
      return {
        status: false,
        statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
        response: {},
        message: error.message,
        metadata: [],
      };
    }
  };
}
module.exports = new UserServices();
