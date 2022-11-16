const db = require("../models");
const Post = db.post;
const dotenv = require('dotenv');
const Message = require('../local/Message');
const { sendResponse, sendError } = require('../utills/CommonHelper');
const { STATUS_CODE } = require('../config/constant');
dotenv.config();
const PostComment = require('../service/post_comment.service');

class PostComments {
    CommentCreate = async (req, res) => {
        try {
            const response = await PostComment.createComment(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, [])
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }
    
    
    // comment delete
    CommentDelete = async (req, res) => {
        try {
            const response = await PostComment.commentDeleteById(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, [])
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

    // Get all comment on a post by the post id
    GetAllCommentById = async (req, res) => {
        try {
            const response = await PostComment.GetAllComment(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, [])     
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }


    changeCommentStatus = async (req, res) => {
        try {
            const response = await PostComment.postCommentStatus(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, [])
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }
}

module.exports = new PostComments();