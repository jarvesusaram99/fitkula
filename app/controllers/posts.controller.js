const db = require("../models");
const Post = db.post;
const dotenv = require('dotenv');
const Message = require('../local/Message');
const { sendResponse, sendError } = require('../utills/CommonHelper');
const { STATUS_CODE } = require('../config/constant');
dotenv.config();
const PostService = require('../service/post.service');
const PostSchema = require('../schema/post_schema');
const PostRepostSchema = require('../schema/post_repost_schema')



class PostController {
    // create Post
    creatingPost = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            // const { error } = PostSchema.ValidatePost(req.lang).validate(req.body);
            // if (error) {
            //     return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            // }
            const response = await PostService.createPost(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata);
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR, false, {}, error.message);
        }
    }


    // Update a post
    updatingPost = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            const { error } = PostSchema.ValidatePost(req.lang).validate(req.body);
            if (error) {
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await PostService.postUpdate(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata);
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }



    // Repost the user post
    repostPost = async (req, res) => {
        let lang = Message["en"];
        req.lang = lang;
        try {
            const { error } = PostRepostSchema.ValidatePostRepost(req.lang).validate(req.body);
            if (error) {
                return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.details[0].message);
            }
            const response = await PostService.repostUserPost(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);;
        }
    }


    // delete Post
    deletePost = async (req, res) => {
        try {
            const response = await PostService.postDelete(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);;
        }
    }

    // Get Post by Id
    findPostById = async (req, res) => {
        try {
            const response = await PostService.getPostById(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

    // Find post of logged in user 
    findPostByUser = async (req, res) => {
        try {
            const response = await PostService.getPostByUser(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

    postByUserId = async (req, res) => {
        try {
            const response = await PostService.getPostByUserId(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

    getAllPostsUser = async (req, res) => {
        try {
            const response = await PostService.getAllPosts(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }

    // Get all photos of a user
    getAllPhotosUser = async (req, res) => {
        try {
            const response = await PostService.getAllPhotos(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }

    changeVisibilityStatus = async (req, res) => {

        try {
            const response = await PostService.postVisibilityStatus(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, response.metadata)
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }
}


module.exports = new PostController();