var express     = require('express'),
    path        = require('path'),
    flash       = require('connect-flash'),
    settings    = require('./settings'),
    app         = require('libby')(express, settings);

app.passport = require('./lib/passport')(app);
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

app.configure(function(){

    // Put (flash) messages in res.locals to know about failed authentication
    // etc.
    app.use(flash());
    app.use(function (req, res, next) {
        res.locals.messages = req.flash();
        next();
    });

    app.use(app.passport.initialize());
    app.use(app.passport.session());

    // has to go after passport.session()
    app.use(function (req, res, next) {
        if (req.user) {
            res.locals.user = req.user;
        }
        next();
    });

    app.use(express.multipart());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..' ,'public')));

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // 500 status
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500);
        res.render('500', {
            status: err.status || 500,
            error: err.message
        });
    });

    // 404 status
    app.use(function(req, res, next) {
        res.status(404);
        res.render('404', {
            status: 404,
            error: 'file not found',
            url: req.url
        });
    });
});


// routes
var core_routes = require('./routes/index');
app.get('/', core_routes.index);
app.get('/login', core_routes.login);
app.post('/login',
         app.passport.authenticate('local', {
             successRedirect: '/',
             failureRedirect: '/login',
             failureFlash: true
         }));
app.get('/auth/google', app.passport.authenticate('google', { scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]}), function(req, res){});
app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), core_routes.google_callback);
app.get('/logout', core_routes.logout);
app.post('/register', core_routes.register);

var forum_routes = require('./routes/forum');
app.get('/forum/', forum_routes.all);
app.get('/forum/:id', forum_routes.get_post);
app.get('/forum/:id/replies', forum_routes.get_replies);
app.post('/forum/', forum_routes.create_post);
app.post('/forum/:id/replies', forum_routes.create_reply);
app.post('/forum/:id/replies/:rid/comments', forum_routes.create_comment);

var organization_routes = require('./routes/organization');
app.get('/organization/memberlist', organization_routes.memberlist);
app.get('/organization/fill_dummy', organization_routes.fill_dummy);

var file_routes = require('./routes/files');
app.get('/files/', file_routes.all);
app.get('/files/new', file_routes.index);
app.post('/files/upload', file_routes.upload);

module.exports = app;
