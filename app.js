var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cors = require("cors");
var morgan = require('morgan');
var compression = require("compression");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var index = require('./routes/index');
var users = require('./routes/users');
var userRoutes=require(path.resolve('.','modules/user/userRoutes'));
var databaseConnector = require(path.resolve('.','modules/database/databaseConnector'));
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
var helmet = require('helmet');
var fs = require('fs');
var session = require('express-session')
var RateLimit = require('express-rate-limit');

var config = require('./config.js');
logger = require(path.resolve('./logger'))

app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 

var limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 100, // limit each IP to 100 requests per windowMs 
  delayMs: 0, // disable delaying - full speed until the max limit is reached 
  message: "You've made too many requests recently. Please wait and try your request again later. "
});


app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'kuhnkfsdnkfnsdkfnsd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(helmet());

app.use(userRoutes);
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.pug');

// Server favicon 
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));

// log only 4xx and 5xx responses to console
app.use(morgan('combined'))

// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

app.use(function(req, res, next) {
  // IE9 doesn't set headers for cross-domain ajax requests
  if(typeof(req.headers['content-type']) === 'undefined'){
    req.headers['content-type'] = "application/json; charset=UTF-8";
  }
  next();
})

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;


