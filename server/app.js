var express     = require('express'),
    path        = require('path'),
    flash       = require('connect-flash'),
    i18n        = require('i18n-abide'),
    settings    = require('./settings'),
    app         = require('libby')(express, settings);

app.passport = require('./lib/passport')(app);
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

app.configure(function(){

    // set jade as template engine
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // Put (flash) messages from connect-flash in res.locals to know about failed authentication
    // etc. Should come before passport initialize.
    app.use(flash());
    app.use(function (req, res, next) {
        res.locals.messages = req.flash();
        next();
    });

    // initialize passport
    app.use(app.passport.initialize());
    app.use(app.passport.session());

    // initialize i18n
    app.use(i18n.abide({
        supported_languages: ['en', 'nb', 'nn', 'he'],
        default_lang: 'nb',
        // to get rotated sentences, set a language in supported and debug that
        // does not have a language folder. he will give right-to-left, but
        // foundation css does not follow automatically, it needs a setting,
        // which makes creating bi-directional layouts impossible.
        //debug_lang: 'he',
        translation_directory: 'server/public/i18n'
    }));

    // has to go after passport.session()
    app.use(function (req, res, next) {
        if (req.user) {
            res.locals.user = req.user;
        }
        next();
    });

    // middleware changing req or res should come before this
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

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

module.exports = app;
