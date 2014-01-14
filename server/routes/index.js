var User = require('../models').User;

// core routes - base is /
module.exports.index = function(req, res) {
    res.render('index', {
        user: req.user
    });
};

module.exports.login = function(req, res){
    res.render('login', {
        user: req.user
    });
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
