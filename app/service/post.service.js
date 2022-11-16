const db = require("../models");
const { STATUS_CODE } = require("../config/constant");
const Post = db.post;
const User = db.users;
const dotenv = require("dotenv");
dotenv.config();
fileUpload = require("express-fileupload");
dotenv.config();
const {
  uploadFile,
  checkFileType,
  deleteFile,
} = require("../utills/CommonHelper");
const PostComments = db.post_comments;
const Address = db.address;
const PostLikes = db.post_likes;
const Followers = db.user_followers;
const Message = require("../local/Message");
const mongoose = require("mongoose");

class PostService {
  createPost = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_CREATED_SUCCESSFULLY, UPLOAD_VALID_FILE } = req.lang;
    const {
      description,
      status,
      visibilityPermission,
      city,
      latitude,
      longitude,
    } = req.body;
    try {
      let response;
      if (req.files) {
        let uploadedFiles = [];
        const new_post = await new Post({
          user_id: req.user.id,
          post_desc: description,
          status,
          visibility_permission: visibilityPermission,
          city,
          latitude,
          longitude,
        });
        await new_post.save();
        const myId = new_post._id;
        const folderName = "user_post";
        if (!Array.isArray(req.files?.images)) {
          uploadedFiles.push(req.files.images);
        } else {
          uploadedFiles = req.files.images;
        }
        const myFileType = await checkFileType(uploadedFiles);
        if (myFileType.includes(false)) {
          return {
            statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
            status: false,
            response: {},
            message: UPLOAD_VALID_FILE,
            metadata: [],
          };
        }
        uploadedFiles = uploadedFiles.map((file) => {
          const fileContent = file.data;
          const name = file.name;
          let uplaodedImg = uploadFile(fileContent, name, folderName, myId);
          return uplaodedImg;
        });
        uploadedFiles = await Promise.all(uploadedFiles);
        response = await Post.findOneAndUpdate(
          { _id: new_post._id },
          { $set: { images: uploadedFiles } },
          { new: true }
        );
      } else {
        const new_post = await new Post({
          user_id: req.user.id,
          post_desc: description,
          status,
          visibility_permission: visibilityPermission,
          city,
          latitude,
          longitude,
        });
        response = await new_post.save();
      }
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $inc: { post_count: 1 } },
        { new: true }
      );
      return {
        statusCode: STATUS_CODE.HTTP_200_OK,
        status: true,
        response: response,
        message: POST_CREATED_SUCCESSFULLY,
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

  // delete Post
  postDelete = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_DELETED_SUCCESSFULLY, NO_POST } = req.lang;
    const { id } = req.params;
    try {
      const post = await Post.findOneAndDelete({ _id: id });
      if (post) {
        await User.findOneAndUpdate(
          { _id: req.user.id },
          { $inc: { post_count: -1 } },
          { new: true }
        );
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: post,
          message: POST_DELETED_SUCCESSFULLY,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: NO_POST,
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

  // Update a Post
  postUpdate = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_UPDATED_SUCCESSFULLY, UPLOAD_VALID_FILE, NO_POST } = req.lang;
    const {
      description,
      status,
      visibilityPermission,
      city,
      latitude,
      longitude,
    } = req.body;
    const { postId } = req.params;
    try {
      let post = await Post.findOne({ _id: postId });
      if (post) {
        let uploadedFiles = [];
        let myDeletedFiles = [];
        let myImages = [];
        post = await Post.findOne({ _id: postId });
        const myId = post._id;
        myImages = post.images;
        const folderName = "user_post";
        let update_post = {
          user_id: req.user.id,
          post_desc: description,
          status,
          visibility_permission: visibilityPermission,
          city,
          latitude,
          longitude,
        };
        if (req.files) {
          if (!Array.isArray(req.files.images)) {
            uploadedFiles.push(req.files.images);
          } else {
            uploadedFiles = req.files.images;
          }
          const myFileType = await checkFileType(uploadedFiles);
          if (myFileType.includes(false)) {
            return {
              statusCode: STATUS_CODE.HTTP_400_BAD_REQUEST,
              status: false,
              response: {},
              message: UPLOAD_VALID_FILE,
              metadata: [],
            };
          } else {
            uploadedFiles = uploadedFiles.map((file) => {
              const fileContent = file.data;
              const name = file.name;
              let uplaodedImg = uploadFile(fileContent, name, folderName, myId);
              return uplaodedImg;
            });
            uploadedFiles = await Promise.all(uploadedFiles);
            myImages = myImages.concat(uploadedFiles);
          }
        }
        if (req.body.deletedFiles) {
          let { deletedFiles } = req.body;
          if (deletedFiles.includes(",")) {
            deletedFiles = deletedFiles.split(",");
            myDeletedFiles = deletedFiles;
          } else {
            myDeletedFiles.push(deletedFiles);
          }
          myImages = myImages.filter((file) => {
            return !myDeletedFiles.includes(file);
          });
          myDeletedFiles = myDeletedFiles.map((file) => {
            let myArray = file.split("/");
            return myArray[myArray.length - 1];
          });
          await deleteFile(folderName, myId, myDeletedFiles);
        }
        update_post.images = myImages;
        const updated_post = await Post.findOneAndUpdate(
          { _id: postId },
          { $set: update_post },
          { new: true }
        );
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: updated_post,
          message: POST_UPDATED_SUCCESSFULLY,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: NO_POST,
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

  //Repost the post of another user
  repostUserPost = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { NO_POST, POST_REPOSTED } = req.lang;
    const { parentPostId, latitude, longitude, city } = req.body;
    try {
      let post = await Post.findOne({ _id: parentPostId });
      if (post) {
        const { images, post_desc } = post;
        const new_post = await new Post({
          parent_post_id: parentPostId,
          user_id: req.user.id,
          post_desc: post_desc,
          images: images,
          city: city,
          latitude: latitude,
          longitude: longitude,
        });
        await new_post.save();
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: new_post,
          message: POST_REPOSTED,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: NO_POST,
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

  // Get Post by Id
  getPostById = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_FETCHED, NO_POST } = req.lang;
    const { postId } = req.params;
    try {
      let post = await Post.findOne({ _id: postId });
      if (post) {
        let is_liked = false;
        let is_followed = false;
        post = await Post.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(postId) } },
          {
            $lookup: {
              from: "post_likes",
              localField: "_id",
              foreignField: "post_id",
              pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
              as: "post_likes",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { post_likes: "$post_likes" },
              pipeline: [
                {
                  $match: { $expr: { $in: ["$_id", "$$post_likes.user_id"] } },
                },
                {
                  $project: {
                    _id: 0,
                    user_id: {
                      _id: "$_id",
                      fullname: "$fullname",
                      image: "$image",
                    },
                  },
                },
              ],
              as: "liked_user",
            },
          },
          {
            $lookup: {
              from: "post_comments",
              localField: "_id",
              foreignField: "post_id",
              pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
              as: "post_comments",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { post_comments: "$post_comments" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$post_comments.user_id"] },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    user_id: {
                      _id: "$_id",
                      fullname: "$fullname",
                      image: "$image",
                    },
                  },
                },
              ],
              as: "commented_user",
            },
          },
        ]);
        const populateQuery = [
          {
            path: "user_id",
            select: "_id fullname image",
            model: User,
          },
          {
            path: "parent_post_id",
            select: "user_id city createdAt visibility_permission",
            populate: {
              path: "user_id",
              select: "fullname image",
              model: User,
            },
            model: Post,
          },
        ];
        post = await Post.populate(post, populateQuery);
        const likes = await PostLikes.find({
          $and: [{ user_id: req.user.id }, { post_id: postId }],
        });
        if (likes.length) {
          is_liked = true;
          post[0].is_liked = is_liked;
        } else {
          post[0].is_liked = is_liked;
        }

        //this is for check follow or not
        const followStatus = await Followers.find({ user_id: req.user.id });
        if (followStatus.length) {
          is_followed = true;
          post[0].is_followed = is_followed;
        } else {
          post[0].is_followed = is_followed;
        }
        return {
          statusCode: STATUS_CODE.HTTP_200_OK,
          status: true,
          response: { post },
          message: POST_FETCHED,
          metadata: [],
        };
      } else {
        return {
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          status: false,
          response: {},
          message: NO_POST,
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

  // Get all post of logged in user
  getPostByUser = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { DONT_HAVE_POST, POST_FETCHED } = req.lang;
    try {
      let is_liked = false;
      const page = parseInt(req.query.page);
      let limit = parseInt(process.env.PAGE_LIMIT);
      let posts = await Post.aggregate([
        { $match: { user_id: mongoose.Types.ObjectId(req.user.id) } },
        {
          $lookup: {
            from: "post_likes",
            localField: "_id",
            foreignField: "post_id",
            // "let": { "post_id": "$_id" },
            pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
            as: "post_likes",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { post_likes: "$post_likes" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$post_likes.user_id"] } } },
              {
                $project: {
                  _id: 0,
                  user_id: {
                    _id: "$_id",
                    fullname: "$fullname",
                    image: "$image",
                  },
                },
              },
            ],
            as: "liked_user",
          },
        },
        {
          $lookup: {
            from: "post_comments",
            localField: "_id",
            foreignField: "post_id",
            // "let": { "post_id": "$_id" },
            pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
            as: "post_comments",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { post_comments: "$post_comments" },
            pipeline: [
              {
                $match: { $expr: { $in: ["$_id", "$$post_comments.user_id"] } },
              },
              {
                $project: {
                  _id: 0,
                  user_id: {
                    _id: "$_id",
                    fullname: "$fullname",
                    image: "$image",
                  },
                },
              },
            ],
            as: "commented_user",
          },
        },
      ])
        .sort({ createdAt: -1 })
        .skip(limit * page - limit)
        .limit(limit);

      const populateQuery = [
        {
          path: "user_id",
          select: "_id fullname image",
          model: User,
        },
        {
          path: "parent_post_id",
          select: "user_id city createdAt visibility_permission",
          populate: {
            path: "user_id",
            select: "fullname image",
            model: User,
          },
          model: Post,
        },
      ];
      posts = await Post.populate(posts, populateQuery);
      const likes = await PostLikes.find({ user_id: req.user.id });
      if (posts.length) {
        for (let i = 0; i < posts.length; i++) {
          let like_status = likes.map((like) => {
            if (posts[i]._id.equals(like.post_id)) {
              return true;
            } else {
              return false;
            }
          });
          if (like_status.includes(true)) {
            is_liked = true;
            posts[i].is_liked = is_liked;
          } else {
            posts[i].is_liked = is_liked;
          }
          is_liked = false;
        }

        //------------------------------Pagination----------------------------------------------------------------------------------//
        const total_count = await Post.find({
          user_id: req.user.id,
        }).countDocuments();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        let results = {};
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
        const count = posts.length;
        const totalPages = Math.ceil(total_count / limit);
        const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
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
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: {
            posts,
            paginationData: {
              count,
              total_count,
              totalPages,
              currentPage,
              prev_page,
              next_page,
            },
          },
          message: POST_FETCHED,
          metadata: [],
        };
      } else {
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: {},
          message: DONT_HAVE_POST,
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

  // Find post of a particular user by Id
  getPostByUserId = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_FETCHED, USER_HAVE_NO_POST, NO_USER } = req.lang;
    const { userId } = req.params;
    try {
      let user = await User.findOne({ _id: userId });
      if (user) {
        const page = parseInt(req.query.page);
        let limit = parseInt(process.env.PAGE_LIMIT);
        let is_liked = false;
        const followings = await Followers.findOne({
          $and: [{ user_id: req.user.id }, { following_id: userId }],
        });
        let match_condition = {};
        if (followings) {
          match_condition = {
            user_id: mongoose.Types.ObjectId(userId),
          };
        } else {
          match_condition = {
            user_id: mongoose.Types.ObjectId(userId),
            visibility_permission: { $ne: 1 },
          };
        }
        let posts = await Post.aggregate([
          {
            $match: match_condition,
          },
          {
            $lookup: {
              from: "post_likes",
              // localField: "_id",
              // foreignField: "post_id",
              let: { post_id: "$_id" },
              pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
              as: "post_likes",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { post_likes: "$post_likes" },
              pipeline: [
                {
                  $match: { $expr: { $in: ["$_id", "$$post_likes.user_id"] } },
                },
                {
                  $project: {
                    _id: 0,
                    user_id: {
                      _id: "$_id",
                      fullname: "$fullname",
                      image: "$image",
                    },
                  },
                },
              ],
              as: "liked_user",
            },
          },
          {
            $lookup: {
              from: "post_comments",
              // localField: "_id",
              // foreignField: "post_id",
              let: { post_id: "$_id" },
              pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
              as: "post_comments",
            },
          },
          {
            $lookup: {
              from: "users",
              let: { post_comments: "$post_comments" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$post_comments.user_id"] },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    user_id: {
                      _id: "$_id",
                      fullname: "$fullname",
                      image: "$image",
                    },
                  },
                },
              ],
              as: "commented_user",
            },
          },
        ])
          .sort({ createdAt: -1 })
          .skip(limit * page - limit)
          .limit(limit);

        if (posts.length) {
          const populateQuery = [
            {
              path: "user_id",
              select: "_id fullname image",
            },
            {
              path: "parent_post_id",
              select: "user_id city createdAt visibility_permission",
              populate: {
                path: "user_id",
                select: "fullname image",
                model: User,
              },
              model: Post,
            },
          ];
          posts = await User.populate(posts, populateQuery);
          const likes = await PostLikes.find({ user_id: req.user.id });
          for (let i = 0; i < posts.length; i++) {
            let like_status = [];
            for (let j = 0; j < likes.length; j++) {
              if (posts[i]._id.equals(likes[j].post_id)) {
                like_status.push(true);
              } else {
                like_status.push(false);
              }
            }
            if (like_status.includes(true)) {
              is_liked = true;
              posts[i]["is_liked"] = is_liked;
            } else {
              posts[i]["is_liked"] = is_liked;
            }
            is_liked = false;
          }

          if (followings) {
            for (let i = 0; i < posts.length; i++) {
              posts[i]["is_followed"] = true;
            }
          } else {
            for (let i = 0; i < posts.length; i++) {
              posts[i]["is_followed"] = false;
            }
          }

          //-----------------------------Pagination------------------------------------------------------------------//
          const total_count = await Post.find(match_condition).countDocuments();
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
          const count = posts.length;
          const totalPages = Math.ceil(total_count / limit);
          const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
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
            status: true,
            statusCode: STATUS_CODE.HTTP_200_OK,
            response: {
              posts,
              paginationData: {
                count,
                total_count,
                totalPages,
                currentPage,
                prev_page,
                next_page,
              },
            },
            message: POST_FETCHED,
            metadata: [],
          };
        } else {
          return {
            status: true,
            statusCode: STATUS_CODE.HTTP_200_OK,
            response: {},
            message: USER_HAVE_NO_POST,
            metadata: [],
          };
        }
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
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

  getAllPosts = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { NO_POST_AVAILABLE, POST_FETCHED } = req.lang;
    try {
      // const page = parseInt(req.query.page);
      let limit = parseInt(process.env.PAGE_LIMIT);
      let myAllPost = [];
      let my_post = [];
      let is_liked = false;
      let is_followed = false;
      let posts = await Post.aggregate([
        {
          $match: {
            user_id: { $ne: mongoose.Types.ObjectId(req.user.id) },
          },
        },
        {
          $lookup: {
            from: "post_likes",
            localField: "_id",
            foreignField: "post_id",
            //"let": { "post_id": "$_id" },
            pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
            as: "post_likes",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { post_likes: "$post_likes" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$post_likes.user_id"] } } },
              {
                $project: {
                  _id: 0,
                  user_id: {
                    _id: "$_id",
                    fullname: "$fullname",
                    image: "$image",
                  },
                },
              },
            ],
            as: "liked_user",
          },
        },
        {
          $lookup: {
            from: "post_comments",
            localField: "_id",
            foreignField: "post_id",
            //"let": { "post_id": "$_id" },
            pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
            as: "post_comments",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { post_comments: "$post_comments" },
            pipeline: [
              {
                $match: { $expr: { $in: ["$_id", "$$post_comments.user_id"] } },
              },
              {
                $project: {
                  _id: 0,
                  user_id: {
                    _id: "$_id",
                    fullname: "$fullname",
                    image: "$image",
                  },
                },
              },
            ],
            as: "commented_user",
          },
        },
      ]);
      // .skip(limit * page - limit)
      // .limit(limit);
      if (posts.length) {
        const populateQuery = [
          {
            path: "user_id",
            select: "_id fullname image",
          },
          {
            path: "parent_post_id",
            select: "user_id city createdAt visibility_permission",
            populate: {
              path: "user_id",
              select: "fullname image",
              model: User,
            },
            model: Post,
          },
        ];
        posts = await User.populate(posts, populateQuery);
        let my_followings = await Followers.find({ user_id: req.user.id });
        for (let i = 0; i < posts.length; i++) {
          if (posts[i].visibility_permission === 1) {
            for (let j = 0; j < my_followings.length; j++) {
              if (posts[i].user_id.equals(my_followings[j].following_id)) {
                myAllPost.push(posts[i]);
              }
            }
          } else {
            myAllPost.push(posts[i]);
          }
        }
        const likes = await PostLikes.find({ user_id: req.user.id });
        for (let i = 0; i < myAllPost.length; i++) {
          let like_status = [];
          for (let j = 0; j < likes.length; j++) {
            if (myAllPost[i]._id.equals(likes[j].post_id)) {
              like_status.push(true);
            } else {
              like_status.push(false);
            }
          }
          if (like_status.includes(true)) {
            is_liked = true;
            myAllPost[i]["is_liked"] = is_liked;
          } else {
            myAllPost[i]["is_liked"] = is_liked;
          }
          is_liked = false;
        }
        const followings = await Followers.find({ user_id: req.user.id });
        for (let i = 0; i < myAllPost.length; i++) {
          let follow_status = [];
          for (let j = 0; j < followings.length; j++) {
            if (myAllPost[i].user_id.equals(followings[j].following_id)) {
              follow_status.push(true);
            } else {
              follow_status.push(false);
            }
          }

          if (follow_status.includes(true)) {
            is_followed = true;
            myAllPost[i]["is_followed"] = is_followed;
          } else {
            myAllPost[i]["is_followed"] = is_followed;
          }
          is_followed = false;
        }
        myAllPost.filter((post) => {
          let addressLat = req.query.lat;
          let addressLon = req.query.lon;
          let postLat = post.latitude;
          let postLon = post.longitude;
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

          my_post.push({ post, distance });

          return my_post;
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
        my_post.sort(function (a, b) {
          var origLat = req.query.lat,
            origLong = req.query.lon;

          return (
            calcDistance(origLat, origLong, a.post.latitude, a.post.longitude) -
            calcDistance(origLat, origLong, b.post.latitude, b.post.longitude)
          );
        });

        //-----------------------------Pagination---------------------------------//
        const total_count = await Post.find({
          user_id: { $ne: req.user.id },
        }).countDocuments();
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        const results = {};
        let prev_page;
        let next_page;
        // if (startIndex > 0) {
        //   results.previous = {
        //     page: page - 1,
        //     limit: limit,
        //   };
        // }
        // if (endIndex < total_count) {
        //   results.next = {
        //     page: page + 1,
        //     limit: limit,
        //   };
        // }
        const count = my_post.length;
        const totalPages = Math.ceil(total_count / limit);
        // const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
        // if (totalPages === currentPage) {
        //   next_page = null;
        // } else {
        //   next_page = results.next.page;
        // }
        // if (currentPage === 1) {
        //   prev_page = null;
        // } else {
        //   prev_page = results.previous.page;
        // }
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: {
            my_post,
            paginationData: {
              count,
              total_count,
              totalPages,
              // currentPage,
              // prev_page,
              // next_page,
            },
          },
          message: POST_FETCHED,
          metadata: [],
        };
      } else {
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: {},
          message: NO_POST_AVAILABLE,
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

  //Get all photos of a user
  getAllPhotos = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { NO_POST_AVAILABLE, POST_FETCHED } = req.lang;
    try {
      const page = parseInt(req.query.page);
      let limit = parseInt(process.env.PAGE_LIMIT);
      let finalArray = [];
      let result = [];
      const allPhotos = await Post.find({ user_id: req.user.id })
        // .skip(limit * page - limit)
        // .limit(limit)
        .select("images");
      finalArray = allPhotos.map(function (obj) {
        return obj.images;
      });
      result = finalArray.flat();
      if (result.length) {
        //------------------------------------------ Pagination------------------------------------------------//
        const countImages = await Post.find({
          user_id: req.user.id,
        }).countDocuments();
        const total_count = result.length;
        const paginatedPotos = paginate(result, limit, page);
        function paginate(result, limit, page) {
          return result.slice((page - 1) * limit, page * limit);
        }

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
        const count = paginatedPotos.length;
        const totalPages = Math.ceil(total_count / limit);
        const currentPage = Math.ceil((startIndex - 1) / limit) + 1;
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
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: {
            paginatedPotos,
            paginationData: {
              count,
              total_count,
              totalPages,
              currentPage,
              prev_page,
              next_page,
            },
          },
          message: POST_FETCHED,
          metadata: [],
        };
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST_AVAILABLE,
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

  postVisibilityStatus = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { POST_STATUS, NO_POST } = req.lang;
    const { visibilityPermission } = req.body;
    const { id } = req.params;
    try {
      let post = await Post.findOne({ _id: id });
      if (post) {
        post = await Post.findOneAndUpdate(
          { _id: id },
          { $set: { visibility_permission: visibilityPermission } },
          { new: true }
        );
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: post,
          message: POST_STATUS,
          metadata: [],
        };
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST,
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
}
module.exports = new PostService();
