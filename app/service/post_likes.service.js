const db = require("../models");
const PostLikes = db.post_likes;
const Post = db.post;
const User = db.users;
const Followers = db.user_followers
const Notifications = db.notifications;
const mongoose = require('mongoose');
const Message = require('../local/Message');
const { STATUS_CODE } = require('../config/constant');
const { sendNotification, sendPushNotifications } = require("../utills/CommonHelper");



class PostlikesService {
    likesOnPost = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { LIKED_SUCCESSFULLY, UNLIKED_SUCCESSFULLY, NO_POST } = req.lang;
        const { postId } = req.params;
        try {
            let post = await Post.findOne({ _id: postId })
            if (post) {
                let new_likes = await PostLikes.findOne({ $and: [{ user_id: req.user.id }, { post_id: postId }] }).select('_id')
                    .populate({
                        path: 'user_id',
                        select: '_id fullname image',
                        model: User
                    });
                if (!new_likes) {
                    new_likes = await new PostLikes({ user_id: req.user.id, post_id: postId });
                    await new_likes.save();
                    let user = await PostLikes.findOne({ $and: [{ user_id: new_likes.user_id }, { post_id: new_likes.post_id }] }).select('_id')
                        .populate({
                            path: 'user_id',
                            select: '_id fullname image',
                            model: User
                        });
                    await Post.findOneAndUpdate({ _id: postId }, { $inc: { like_count: 1 } }, { new: true });
                    let likers = await User.find({ _id: req.user.id });
                    let post = await Post.find({ _id: postId });
                    let like_to = await User.find({ _id: post[0].user_id })
                    let noti_message = `${likers[0].fullname} liked your post.`;
                    // sendPushNotifications({
                    //     users: [like_to[0]],
                    //     noti_type: 'New Like',
                    //     noti_message: noti_message,
                    //     post_id: postId,
                    //     liked_by: req.user.id,
                    //     image: likers[0].image
                    // })
                    return {
                        statusCode: STATUS_CODE.HTTP_200_OK,
                        status: true,
                        response: {
                            user: user,
                            isLiked: true
                        },
                        message: LIKED_SUCCESSFULLY,
                        metadata: []
                    }

                } else {
                    let user = await PostLikes.findOne({ $and: [{ user_id: req.user.id }, { post_id: postId }] }).select('_id')
                        .populate({
                            path: 'user_id',
                            select: '_id fullname image',
                            model: User
                        });
                    await PostLikes.findOneAndDelete({ $and: [{ user_id: req.user.id }, { post_id: postId }] })
                    const likecount = await Post.find({ _id: postId });
                    if (likecount[0].like_count > 0) {
                        await Post.findOneAndUpdate({ _id: postId }, { $inc: { like_count: -1 } }, { new: true });
                    }
                    await Notifications.findOneAndDelete({ $and: [{ liked_by: req.user.id }, { post_id: postId }] })
                    return {
                        statusCode: STATUS_CODE.HTTP_200_OK,
                        status: true,
                        response: {
                            user: user,
                            isLiked: false
                        },
                        message: UNLIKED_SUCCESSFULLY,
                        metadata: []
                    }
                }

            }
            else {
                return {
                    statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
                    status: false,
                    response: {},
                    message: NO_POST,
                    metadata: []
                }
            }

        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }


    likersOnPost = async (req) => {
        let lang = Message["en"];
        req.lang = lang;
        const { GET_LIKERS, NO_LIKERS, NO_POST } = req.lang;
        const { postId } = req.params
        try {
            let post = await Post.findOne({ _id: postId })
            if (post) {
                let is_followed = false
                let all_post_likers = []
                let my_followings = await Followers.find({ user_id: req.user.id })
                let likers = await Post.aggregate([
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(postId)
                        }
                    },
                    {
                        $lookup: {
                            from: "post_likes",
                            localField: "_id",
                            foreignField: "post_id",
                            as: "post_likes"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { post_likes: "$post_likes" },
                            pipeline: [
                                { $match: { "$expr": { "$in": ["$_id", "$$post_likes.user_id"] } } },
                                { $project: { _id: 0, user_id: { _id: '$_id', fullname: '$fullname', image: '$image' } } }
                            ],
                            as: "liked_user"
                        }
                    },
                    {
                        $lookup: {
                            from: "addresses",
                            let: { post_likes: "$post_likes" },
                            pipeline: [
                                { $match: { "$expr": { "$in": ["$user_id", "$$post_likes.user_id"] } } },
                                { $project: { _id: 0, user_id: { _id: '$_id', address_line_1: '$address_line_1', address_line_2: "$address_line_2" } } },
                            ],
                            as: "user_address"
                        }
                    }

                ])

                if (likers.length && likers[0].liked_user.length) {
                    for (let i = 0; i < likers[0].liked_user.length; i++) {
                        let follow = my_followings.map((follower) => {
                            if (likers[0].liked_user[i].user_id._id.equals(follower.following_id)) {
                                return true
                            }
                            else {
                                return false
                            }
                        })
                        if (follow.includes(true)) {
                            all_post_likers.push({
                                liked_user: likers[0].liked_user[i].user_id,
                                user_address: likers[0].user_address[likers[0].user_address.length - 1 - i].user_id,
                                is_followed: true
                            })
                        }
                        else {
                            all_post_likers.push({
                                liked_user: likers[0].liked_user[i].user_id,
                                user_address: likers[0].user_address[likers[0].user_address.length - 1 - i].user_id,
                                is_followed
                            })
                        }
                    }
                    return {
                        statusCode: STATUS_CODE.HTTP_200_OK,
                        status: true,
                        response: { all_post_likers },
                        message: GET_LIKERS,
                        metadata: []
                    }
                }
                else {
                    return {
                        statusCode: STATUS_CODE.HTTP_200_OK,
                        status: true,
                        response: {},
                        message: NO_LIKERS,
                        metadata: []
                    }
                }
            }
            else {
                return {
                    statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
                    status: false,
                    response: {},
                    message: NO_POST,
                    metadata: []
                }
            }

        } catch (error) {
            return {
                status: false,
                statusCode: STATUS_CODE.HTTP_500_INTERNAL_SERVER_ERROR,
                response: {},
                message: error.message,
                metadata: []
            }
        }
    }
}

module.exports = new PostlikesService();