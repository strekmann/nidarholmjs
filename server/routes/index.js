var crypto = require('crypto'),
    User = require('../models').User;

// core routes - base is /
module.exports.index = function(req, res) {
    res.render('index');
};

module.exports.login = function(req, res){
    res.render('login');
};

module.exports.logout = function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
};

module.exports.google_callback = function(req, res){
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
};

module.exports.register = function(req, res) {
    // TODO: Use sanitizer
    if (req.body.name && req.body.desired_username && req.body.password1 && req.body.password2) {
        var username = req.body.desired_username.toLowerCase();
        if (!username) {
            req.flash('error', 'Username missing');
            res.redirect('/login');
        } else {
            // Check if user already exists
            User.findOne({'username': username}).exec(function (err, otheruser) {
                if (otheruser) {
                    req.flash('error', 'Username already taken');
                    res.redirect('/login');
                } else {
                    // Check if passwords are equal
                    var password1 = req.body.password1.trim();
                    var password2 = req.body.password2.trim();
                    if (password1 !== password2) {
                        req.flash('error', 'Passwords not equal');
                        res.redirect('/login');
                    } else {
                        // Hash password and save password, salt and hashing algorithm
                        var algorithm = 'md5';
                        var salt = crypto.randomBytes(128).toString('base64');
                        var hashedPassword = crypto.createHash(algorithm);
                        hashedPassword.update(password1);
                        hashedPassword.update(salt);

                        var user = new User();
                        user.name = req.body.name.trim();
                        user.username = username;
                        user._id = user.username;
                        user.password = hashedPassword.digest('hex');
                        user.salt = salt;
                        user.algorithm = algorithm;
                        user.save(function (err) {
                            if (err) {
                                console.log("Error saving user:", err);
                            } else {
                                // Log in newly registered user automatically
                                req.logIn(user, function (err) {
                                    if(!err){
                                        // TODO: Since this is first login, redirect to account page
                                        req.flash('info', 'You are now registered, and logged in.');
                                        res.redirect('/');
                                    } else {
                                        req.flash('error', 'There was something wrong with your newly created user that prevented us from logging in for you. Please try to login yourself.');
                                        res.redirect('/login');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    } else {
        req.flash('error', 'Information missing');
        res.redirect('/login');
    }
};
