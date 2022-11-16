const { STATUS_CODE } = require("../config/constant");
const db = require("../models");
const {
  sendNotification,
  sendPushNotifications,
} = require("../utills/CommonHelper");
const PostComments = db.post_comments;
const Followers = db.user_followers;
const Message = require("../local/Message");
const Post = db.post;
const User = db.users;

class PostComment {
  createComment = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { COMMENT_CREATED_SUCCESSFULLY, NO_POST } = req.lang;
    const { id } = req.params;
    const { comment } = req.body;
    try {
      let post = await Post.findOne({ _id: id });
      if (post) {
        if (post.comment_permission === 2) {
          return {
            status: false,
            statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
            response: {},
            message: "You can not Comment on this post",
            metaData: [],
          };
        }


        if (post.comment_permission === 1) {
          const followers = await Followers.findOne({ user_id: req.user.id });
          if (followers) {
            const new_comment = await new PostComments({
              user_id: req.user.id,
              comment: comment,
              post_id: id,
            });
            await new_comment.save();
            post = await Post.findOneAndUpdate(
              { _id: id },
              { $inc: { comment_count: 1 } },
              { new: true }
            );
            let commenters = await User.find({ _id: req.user.id });
            let comment_to = await User.find({ _id: post.user_id });
            let noti_message = `${commenters[0].fullname} commented on your post.`;
            // sendPushNotifications({
            //   users: comment_to,
            //   noti_type: "New Comment",
            //   noti_message: noti_message,
            //   post_id: id,
            //   commented_by: req.user.id,
            //   image: commenters[0].image,
            // });
            return {
              status: true,
              statusCode: STATUS_CODE.HTTP_200_OK,
              response: { new_comment },
              message: COMMENT_CREATED_SUCCESSFULLY,
              metaData: [],
            };
          } else {
            return {
              status: false,
              statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
              response: {},
              message: "You can not Comment on this post",
              metaData: [],
            };
          }
        }

        
        if(post.comment_permission === 0){
          const new_comment = await new PostComments({
            user_id: req.user.id,
            comment: comment,
            post_id: id,
          });
          await new_comment.save();
          post = await Post.findOneAndUpdate(
            { _id: id },
            { $inc: { comment_count: 1 } },
            { new: true }
          );
          let commenters = await User.find({ _id: req.user.id });
          let comment_to = await User.find({ _id: post.user_id });
          let noti_message = `${commenters[0].fullname} commented on your post.`;
          // sendPushNotifications({
          //   users: comment_to,
          //   noti_type: "New Comment",
          //   noti_message: noti_message,
          //   post_id: id,
          //   commented_by: req.user.id,
          //   image: commenters[0].image,
          // });
          return {
            status: true,
            statusCode: STATUS_CODE.HTTP_200_OK,
            response: { new_comment },
            message: COMMENT_CREATED_SUCCESSFULLY,
            metaData: [],
          };
        }
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST,
          metaData: [],
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

  //comment dlelte
  commentDeleteById = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { COMMENT_DELETED_SUCCESSFULLY, NO_POST } = req.lang;
    const { commentId, postId } = req.params;
    try {
      let post = await Post.findOne({ _id: postId });
      if (post) {
        const response = await PostComments.findOneAndDelete({
          _id: commentId,
        });
        const post = await Post.findOneAndUpdate(
          { _id: postId, comment_count: { $gte: 0 } },
          { $inc: { comment_count: -1 } },
          { new: true }
        );
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: response,
          message: COMMENT_DELETED_SUCCESSFULLY,
          metaData: [],
        };
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST,
          metaData: [],
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

  // Get all comment by id
  GetAllComment = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { COMMENTS_FETCHED, NO_COMMENTS, NO_POST } = req.lang;
    const { postId } = req.params;
    try {
      let post = await Post.findOne({ _id: postId });
      if (post) {
        const page = parseInt(req.query.page);
        let limit = parseInt(process.env.PAGE_LIMIT);
        const all_comments = await PostComments.find({ post_id: postId })
          .select("comment")
          .populate({
            path: "user_id",
            select: "_id fullname image",
            model: User,
          })
          .skip(limit * page - limit)
          .limit(limit);

        //-----------------------------Pagination----------------------------------------------------------------------------------//

        if (all_comments.length) {
          const total_count = await PostComments.find({
            post_id: postId,
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
          const count = all_comments.length;
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
              all_comments,
              paginationData: {
                count,
                total_count,
                totalPages,
                currentPage,
                prev_page,
                next_page,
              },
            },
            message: COMMENTS_FETCHED,
            metadata: [],
          };
        } else {
          return {
            status: true,
            statusCode: STATUS_CODE.HTTP_200_OK,
            response: {},
            message: NO_COMMENTS,
            metaData: [],
          };
        }
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST,
          metaData: [],
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

  postCommentStatus = async (req) => {
    let lang = Message["en"];
    req.lang = lang;
    const { COMMENT_STATUS, NO_POST } = req.lang;
    const { id } = req.params;
    try {
      let post = await Post.findOne({ _id: id });
      if (post) {
        const { commentPermission } = req.body;
        const post = await Post.findOneAndUpdate(
          { _id: id },
          { $set: { comment_permission: commentPermission } },
          { new: true }
        );
        return {
          status: true,
          statusCode: STATUS_CODE.HTTP_200_OK,
          response: post,
          message: COMMENT_STATUS,
          metaData: [],
        };
      } else {
        return {
          status: false,
          statusCode: STATUS_CODE.HTTP_404_NOT_FOUND,
          response: {},
          message: NO_POST,
          metaData: [],
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

module.exports = new PostComment();
