const postsController = require('../controllers/posts.controller');
// const { post} = require('../controllers/posts.controller');
const middlewares = require('../middlewares/middlewares.js');
const router = require("express").Router();

router.post("/",middlewares.authenticateToken,postsController.creatingPost);
router.post("/repost",middlewares.authenticateToken,postsController.repostPost);
router.put("/update/:postId",middlewares.authenticateToken,postsController.updatingPost);
router.delete("/:id",middlewares.authenticateToken,postsController.deletePost);
router.get("/:postId",middlewares.authenticateToken,postsController.findPostById);
router.get("/",middlewares.authenticateToken,postsController.findPostByUser);
router.get("/getPost/:userId",middlewares.authenticateToken,postsController.postByUserId);
router.get("/get/allPost",middlewares.authenticateToken,postsController.getAllPostsUser);
router.get("/getPhotos/allPhotos",middlewares.authenticateToken,postsController.getAllPhotosUser);
router.post("/status/:id",middlewares.authenticateToken,postsController.changeVisibilityStatus);


module.exports = router;