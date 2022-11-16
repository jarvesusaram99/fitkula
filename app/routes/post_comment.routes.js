const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/middlewares.js');
const PostComments = require('../controllers/post_comment.controller');

router.post('/:id', middlewares.authenticateToken, PostComments.CommentCreate);
router.delete('/:commentId/:postId', middlewares.authenticateToken, PostComments.CommentDelete);
router.get('/:postId', middlewares.authenticateToken, PostComments.GetAllCommentById);
router.get('/:postId', middlewares.authenticateToken, PostComments.GetAllCommentById);
router.put('/commentStatus/:id', middlewares.authenticateToken, PostComments.changeCommentStatus);

module.exports = router;