var path = require('path');
var db = require(path.resolve('.', 'modules/database/databaseConnector.js'));
var responseGenerator = require(path.resolve('.', 'utils/responseGenerator.js'))
var emailHandler = require(path.resolve('./', 'utils/emailHandler.js'));
var template = require(path.resolve('./', 'utils/emailTemplates.js'))
var msg = require(path.resolve('./', 'utils/errorMessages.js'))
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(path.resolve('./', 'config'));
logger = require(path.resolve('./logger'));
var salt = bcrypt.genSaltSync(10);

/*Index : API to Register/Signup the user
  Author : Danish
  Route : /signup
  Request Type : POST
 */

exports.signup = function (req, res) {
    // Hash the password with the salt
    var hash = bcrypt.hashSync(req.body.password, salt);
    username = req.body.username;
    email = req.body.email;
    password = hash;

    //callback function to make new account
    function accountCheck(callback) {
        //check for account if it already exists
        var sql = 'SELECT EXISTS (SELECT 1 FROM users WHERE email = ?) AS accountExists; '

        db.query(sql, [email], function (error1, results1) {
            if (error1) {
                logger.warn("error while processing request");

            } else {
                console.log(JSON.stringify(results1));
                if (results1[0].accountExists == 1) {
                    logger.warn("Email Already Exists");
                    // callback();
                    res.send(responseGenerator.getResponse(500, "Email already exists", null))
                } else {
                    logger.info("Signing Up");
                    callback();

                }

            }
        })
    }
    accountCheck(function () {
        //procedure call to insert new user
        db.query('call signupUser("' + username + '","' + email + '","' + password + '")', function (error, results) {
            if (!error) {
                var data = {
                    id: results[0][0].id,
                    username: results[0][0].username,
                    email: results[0][0].email
                }
                //generation of jwt token
                var token = jwt.sign(
                    data, config.privateKey, {
                        expiresIn: 3600
                    });

                //=======================================code to send verification email on signup========================================================
                var message
                template.welcome(username, token, function (err, msg) {
                    message = msg;
                })
                emailHandler.sendEmail(req.body.email, "Welcome to Cryptoriyal", message, function (error, callback) {
                    if (error) {
                        logger.warn("Failed to send Verification link to linked mail");

                        res.send(responseGenerator.getResponse(500, "Failed to send Verification link to linked mail", null))
                    } else {
                        logger.info("Verification link sent to mail");

                        res.send(responseGenerator.getResponse(200, "Please click on the verification link you received in registered email", {
                            token: token,
                            username: results[0][0].username,
                            email: results[0][0].email,
                            profilePictureURL: results[0][0].profilepicUrl
                        }))
                    }
                });
                //========================================end of code for mail verification=================================================================
            }
            else {
                logger.error("Error while processing your request", error);
                res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
            }
        })
    });
}

//function for verification of user account on signup
exports.activateAccount = function (req, res) {
    var token = req.body.headers.auth[0];
    if (token) {
        //check if token is valid        
        jwt.verify(token, config.privateKey, function (err, result) {
            if (err) {
                logger.error(msg.tokenInvalid);
                res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
            } else {
                //db call to update account status of user
                sql = "UPDATE users SET accountStatus = 'active' WHERE email=?"
                db.query(sql, [result.email], function (error, results) {
                    if (error) {
                        logger.error("Error while processing your request -- in activate account", error);
                        res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
                    } else {
                        logger.info("Successfully verified your email, Please login now.");
                        res.send(responseGenerator.getResponse(200, "Successfully verified your email, Please login now.", true))
                    }
                })
            }
        })
    } else {
        //if received token is invalid        
        logger.error(msg.tokenInvalid);
        res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
    }
}


/*Index : API to login for the user
  Author : Danish
  Route : /login
  Request Type : POST
 */

exports.login = function (req, res) {
    // var token = req.headers.auth;
    var email = req.body.email;
    var password = req.body.password;
    console.log(email, password);
    sql = 'SELECT * FROM users WHERE email = ? AND login_type = 1 AND isDeleted = 0';
    db.query(sql, [email], function (error, results, fields) {
        var token;
        if (error) {
            logger.error("Error while processing your request in login ", error);
            res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
        } else {
            if (results.length > 0) {
                var data = {
                    id: results[0].id,
                    username: results[0].username,
                    email: results[0].email,
                }
                token = jwt.sign(
                    data, config.privateKey, {
                        expiresIn: 25200
                    });

                //To compare the entered password and the password entered by the user
                if (bcrypt.compareSync(password, results[0].password)) {
                    if (results[0].accountStatus == 'active') {
                        console.log("Login Successfull");
                        logger.info("Login Successfull");
                        res.send(responseGenerator.getResponse(200, "Login successful", {
                            token: token,
                            email: results[0].email
                        }))
                    } else if (results[0].accountStatus == 'pending') {
                        logger.warn("Account status is pending");
                        res.send(responseGenerator.getResponse(500, "Account status is pending", {
                            token: token
                        }))
                    } else {
                        logger.warn("Account is deactivated");
                        res.send(responseGenerator.getResponse(500, "Account is deactivated", null))
                    }
                } else {
                    logger.warn("Wrong username or password");
                    res.send(responseGenerator.getResponse(500, "Wrong username or password", null))
                }
            } else {
                logger.warn("Wrong username or password");
                res.send(responseGenerator.getResponse(500, "Wrong username or password", null))
            }
        }
    });
}


/*Index : API for forgot password request
  Author : Danish
  Route : /forgot
  Request Type : POST
 */

exports.forgot = function (req, res, next) {

    sql = 'SELECT * FROM users WHERE email = ? and login_type = 1';

    db.query(sql, [req.body.email],
        function (error, results, fields) {
            if (!error) {

                //check if email exists
                if (results.length > 0) {
                    var data = {
                        id: results[0].id,
                        name: results[0].name,
                        email: results[0].email
                    }
                    var token = jwt.sign(
                        data, config.privateKey, {
                            expiresIn: 1800
                        });
                    //=======================================code to reset password link to email========================================================

                    var message
                    template.forgot(results[0].username, token, function (err, msg) {
                        message = msg;
                    })

                    emailHandler.sendEmail(req.body.email, "Reset Password Request", message, function (error, callback) {
                        if (error) {
                            logger.error("Failed to send reset link to linked mail", error);

                            res.send(responseGenerator.getResponse(500, "Failed to send reset link to linked mail", null))
                        } else {
                            logger.info("Verification link sent to mail");

                            res.send(responseGenerator.getResponse(200, "Please click on the link you received in registered email to reset your password", []))
                        }

                    });
                    //========================================end of code to send mail=================================================================    

                } else {
                    logger.warn("Email does not exists");
                    res.send(responseGenerator.getResponse(500, "Email does not exists", null))
                }
            } else {
                logger.error("Error while processing your request --forgot password", error);
                res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
            }
        })
}

/*Index : API to resend verification link
  Author : Danish
  Route : /resendMail
  Request Type : POST
 */

exports.resendMail = function (req, res) {
    var token = req.body.headers.auth[0];
    if (token) {

        //check if token is valid
        jwt.verify(token, config.privateKey, function (err, result) {
            if (err) {
                logger.error(msg.tokenInvalid);
                res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
            } else {
                //=======================================code to resend verification email on signup========================================================

                var message
                template.welcome(result.username, token, function (err, msg) {
                    message = msg;
                })
                emailHandler.sendEmail(result.email, "Welcome to Cryptoriyal", message, function (error, callback) {
                    if (error) {
                        logger.error("Failed to resend Verification link to linked mail");

                        res.send(responseGenerator.getResponse(500, "Failed to resend Verification link to linked mail", null))
                    } else {
                        logger.info("Verification link sent to mail");

                        res.send(responseGenerator.getResponse(200, "Please click on the verification link you received in registered email", true))
                    }
                });
                //========================================end of code for mail verification=================================================================    
            }
        })
    } else {
        //if received token is invalid
        logger.error(msg.tokenInvalid);
        res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
    }
}


/*Index : API to reset new user password
  Author : Danish
  Route : /reset
  Request Type : POST
 */

exports.reset = function (req, res) {

    var token = req.headers.auth;
    var hash = bcrypt.hashSync(req.body.password, salt);

    var password = hash;
    if (token) {
        //check if token is valid        
        jwt.verify(token, config.privateKey, function (err, result) {
            if (err) {
                logger.error(msg.tokenInvalid);
                res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
            } else {
                //db call to update account status of user
                sql = "UPDATE users SET password = ? where email=?"
                db.query(sql, [password, result.email], function (error, results) {
                    if (error) {
                        logger.error("Error while processing your request -- in Reset password", error);
                        res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
                    } else {
                        logger.info("Successfully Changed your password.");
                        res.send(responseGenerator.getResponse(200, "Successfully Changed your password", true))
                    }
                })
            }
        })
    } else {
        //if received token is invalid        
        logger.error(msg.tokenInvalid);
        res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
    }

}

/*Index : API to change the password and other details of the user using the dashboard.
  Author : Danish
  Route : /change_settings
  Request Type : POST
 */

exports.change_settings = function (req, res) {

    var token = req.headers.auth;
    var username = req.body.username;
    var email = req.body.email;
    var old_password = req.body.old_password;
    var new_password = req.body.new_password;

    if (token) {
        //check if token is valid        
        jwt.verify(token, config.privateKey, function (err, result) {
            if (err) {
                logger.error(msg.tokenInvalid);
                res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
            }

            else {

                var email = result.email;

                var query = "select password from users where email = ?";
                db.query(query, email, function (err, result2) {
                    if (err) throw err;
                    else {
                        if (bcrypt.compareSync(old_password, result2[0].password)) {

                            var hash = bcrypt.hashSync(new_password, salt);
                            new_password = hash;

                            sql = "update users set username = ?, password = ? where email=?"
                            db.query(sql, [username, new_password, email], function (error, results) {
                                if (error) {
                                    logger.error("Error while processing your request", error);
                                    res.send(responseGenerator.getResponse(500, "Error while processing your request", null))
                                } else {
                                    logger.info("Successfully Changed your Details.");

                                    //generation of jwt token
                                    var data = {
                                        username: username,
                                        email: email
                                    }

                                    res.send(responseGenerator.getResponse(200, "Successfully Changed your Details", []))

                                }
                            })

                        }

                        else {
                            res.send(responseGenerator.getResponse(500, "Wrong Password Entered", []))
                        }

                    }
                });

            }
        })
    } else {
        //if received token is invalid        
        logger.error(msg.tokenInvalid);
        res.send(responseGenerator.getResponse(500, msg.tokenInvalid, null))
    }

}

/*Index : API to get the user details from id.
  Author : Danish
  Route : /get_user_details
  Request Type : POST
 */

exports.getUserDetails = function (req, res) {

    var token = req.headers.auth;
    if (token) {
        //check if token is valid        
        jwt.verify(token, config.privateKey, function (err, result) {
            if (err) {
                logger.error(msg.tokenInvalid);
                res.send(responseGenerator.getResponse(500, "Token has been expired", null))
            }

            else {

                var id = result.id;
                var query = "SELECT username, email from users where id = ? and account_status = 'active' ";
                db.query(query, id, function (errQuery, resultQuery) {
                    if (errQuery)
                        throw errQuery;
                    else {
                        res.send(responseGenerator.getResponse(200, "Records shown successfully!!!", resultQuery));
                    }
                });
            }
        });
    }
}


