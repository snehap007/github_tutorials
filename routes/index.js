var express = require('express');
var router = express.Router();
var path = require('path');


var app = express(); //require(path.resolve('.','app.js'));


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Cryptoriyal Platform API' });
});

module.exports = router;
