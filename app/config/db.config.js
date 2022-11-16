const dotenv = require('dotenv');
dotenv.config();
module.exports = {
	// url: "mongodb://localhost:27017/fitkula_db"
    url:process.env.LIVE_DATABASE_URL
  };

  