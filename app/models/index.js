const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.users = require("./user.model.js")(mongoose);
db.user_otp = require("./user_otps.model.js")(mongoose);
db.refresh_token = require("./refresh_token.model")(mongoose);
db.address = require("./address.model.js")(mongoose);
db.user_followers = require('./user_followers.model.js')(mongoose);

db.post = require('./posts.model.js')(mongoose);
db.post_likes = require('./post_likes.model.js')(mongoose);
db.post_comments = require('./posts_comment.model.js')(mongoose)

module.exports = db;