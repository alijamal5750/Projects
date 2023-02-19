const path=require('path');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config({ path: "config.env" });
const dbConnecction = require("./config/database");
const ApiError = require("./utils/apiError");
const GlobalError = require("./middlwares/errorMiddleware");
// without /index cuz it will read automaticaly :
const mountRoute=require('./routes');
const cors=require('cors');
const compression=require('compression');

// connect to our database :
dbConnecction();

// express app
const app = express();
// enable cors : let other domains and frontEnd side app to access our backend (not block him) : 
app.use(cors());
// enable image : * to access all method get,post,put,delete....etc  this will enable in headers(postman) this command : Access-Control-Allow-Origin wht value *
app.options('*',cors());

// compression the responce back to user (make our application faster on real deployment) :
app.use(compression());

// server images in Browser , localhost:port/categories/filename
app.use(express.static(path.join(__dirname,'uploads')));

// middleware
app.use(express.json());


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoute(app);

// if there are any route of our Routes api/v1/... send error by error handling
app.all("*", (req, res, next) => {
  // create error and send it to error handling middleware :
  //  const err=new Error('Cant find this Route : ' + req.originalUrl);
  //  next(err.message);

  // create class and pass the message and status code to it :
  next(new ApiError(`Cant find this route : ${req.originalUrl}`, 400));
});

// if he passed away from mount Routes so everythink ok>>>else use the error handling below if any problem happen
// Global Error Handling Middleware for Express :
app.use(GlobalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running by port : ${PORT}`);
});

// Events => listen => callback(err) handle errors out of express,I dont need to use catch in database class or any class out of express
// handle rejections outside Express :
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors : ${err.name}${err.message}`);
  // do all the requests (complete request bending or in prccess) then close the server and application :
  server.close(() => {
    console.error("Shutting Down...");
    process.exit(1);
  });
});
