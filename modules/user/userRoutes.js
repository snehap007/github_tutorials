var path = require('path');
var api = require('./../../modules/user/userController.js');
var express = require('express');
var router = express.Router();

router.post('/signup', api.signup);
router.post('/activateAccount', api.activateAccount)
router.post('/login', api.login)
router.post('/forgot', api.forgot)
router.post('/resendMail',api.resendMail)
router.post('/reset',api.reset)
router.post('/changeSettings', api.change_settings);
router.post('/getUserDetails', api.getUserDetails);
module.exports = router;


