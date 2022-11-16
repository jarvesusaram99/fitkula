const express = require('express');
const router = express.Router();
const middlewares = require('../middlewares/middlewares.js');
const Postlikes = require("../controllers/post_likes.controller");


router.post('/likes/:postId',middlewares.authenticateToken,Postlikes.createLikes);
router.get('/getLikes/:postId',middlewares.authenticateToken,Postlikes.getAllLikers);



module.exports = router;