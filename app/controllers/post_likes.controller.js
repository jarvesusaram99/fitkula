const PostlikesService = require('../service/post_likes.service');
const Message = require('../local/Message');
const { sendResponse, sendError } = require('../utills/CommonHelper');
const { STATUS_CODE } = require('../config/constant');

class Postlikes {
    createLikes = async (req, res) => {
        try {
            const response = await PostlikesService.likesOnPost(req);
            return sendResponse(
                res, response.statusCode, response.status,
                { user: response.response.user, isLiked: response.response.isLiked },
                response.message, response.metadata)

        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }
    }

    getAllLikers = async (req, res) => {
        try {
            const response = await PostlikesService.likersOnPost(req);
            return sendResponse(res, response.statusCode, response.status, response.response, response.message, [])
        } catch (error) {
            return sendError(res, STATUS_CODE.HTTP_400_BAD_REQUEST, false, {}, error.message);
        }

    }
}
module.exports = new Postlikes();