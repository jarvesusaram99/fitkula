const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const fileUpload = require('express-fileupload')
const app = express();
const users = require("./app/routes/user.routes");
const address = require('./app/routes/address.routes');

const post = require('./app/routes/post.routes');
const postComments = require('./app/routes/post_comment.routes');
const post_likes = require('./app/routes/post_likes.routes');


app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload({ createParentPath: true }));

// var corsOptions = {
//   origin: "http://13.57.222.64"
// };


const db = require("./app/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// app.use(cors(corsOptions));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if ('OPTIONS' == req.method) {
     res.sendStatus(200);
   }
   else {
     next();
   }});


const router= require("./app/routes");





//Importing User routes
app.use("/api/v1/users",users);

// Importing Address routes
app.use("/api/v1/address", address)

//Importing Admin routes
// app.use("/api/v1/admin",admin);

// Importing Followers routes 
// app.use('/api/v1/user', followers);

//update accesstoken
// app.use('/api/v1/newAccess',newAccessToken);


//Importing Post routes
app.use('/api/v1/post',post);
app.use('/api/v1/post/comments',postComments);
app.use('/api/v1/post',post_likes);
// app.use('/api/v1/post/report',post_reports);

// set port, listen for requests
const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
