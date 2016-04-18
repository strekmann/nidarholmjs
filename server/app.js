var _           = require('underscore'),
    express     = require('express'),
    path        = require('path'),
    marked      = require('marked'),
    moment      = require('moment'),
    mongoose    = require('mongoose'),
    multer = require('multer'), // for project_routes
    upload = multer({ storage: multer.diskStorage({}) }).single('file'),
    settings    = require('./settings'),
    util        = require('./lib/util'),
    persistentLogin = require('./lib/middleware').persistentLogin,
    app         = require('libby')(express, settings);

var User = require('./models/index').User,
    Group = require('./models/index').Group,
    Organization = require('./models/index').Organization;

app.passport = require('./lib/passport')(app);
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

var get_member_group = function () {
    var promise = new mongoose.Promise();

    Group.findOne({name: 'Medlemmer'}, function (err, group) {
        if (err) { throw err; }

        if (!group) {
            // testing
            group = new Group();
            group._id = 'medlemmer';
            group.name = 'Medlemmer';
            group.save(function () {
                promise.fulfill(group);
            });
        }
        else {
            promise.fulfill(group);
        }
    });

    return promise;
};

// set jade as template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// initialize passport
app.use(app.passport.initialize());
app.use(app.passport.session());
app.use(app.passport.authenticate('remember-me'));

app.use(function (req, res, next) {
    if (settings.fake_user_username) {
        User.findOne({username: settings.fake_user_username}, function (err, user) {
            if (err) { return next(err); }
            if (user) {
                req.user = res.locals.user = user;
            }
            return next();
        });
    }
    else {
        return next();
    }
});

// utils
app.use(function (req, res, next) {
    moment.locale(req.locale); // has to come before the next functions
    res.locals.stamp = app.stamp;
    res.locals._ = _;
    res.locals.marked = marked;
    res.locals.moment = moment;
    res.locals.isodate = util.isodate;
    res.locals.simpledate = util.simpledate;
    res.locals.shortdate = util.shortdate;
    res.locals.longdate = util.longdate;
    res.locals.ago = util.ago;
    res.locals.daterange = util.daterange;
    res.locals.prettyhost = util.prettyhost;
    res.locals.phoneformat = util.phoneformat;
    next();
});

// init org
app.use(function (req, res, next) {
    Organization.findById('nidarholm')
    .populate('member_group')
    .populate('administration_group') // no need to select fields, ids only
    .exec(function (err, organization) {
        if (err) { return next(err); }
        if (organization) {
            req.organization = res.locals.organization = organization;
            // is it a hack?
            if (!organization.description) {
                organization.description = {};
            }
            if (!organization.administration_group) {
                organization.administration_group = organization.member_group;
            }
            res.locals.address = req.protocol + "://" + organization.webdomain;
            res.locals.path = req.path;
            next();
        } else {
            get_member_group().then(function (group) {
                organization = new Organization();
                organization._id = 'nidarholm';
                organization.webdomain = 'nidarholm.no';
                organization.instrument_groups = [];
                organization.member_group = group;

                organization.save(function (err) {
                    if (err) { return next(err); }
                    group.organization = organization;
                    group.save(function (err) {
                        if (err) { return next(err); }
                        req.organization = res.locals.organization = organization;
                        if (!organization.description) {
                            organization.description = {};
                        }
                        if (!organization.administration_group) {
                            organization.administration_group = organization.member_group;
                        }
                        res.locals.address = req.protocol + "://" + organization.webdomain;
                        res.locals.path = req.path;
                        next();
                    });
                });
            });
        }
    });
});
// has to go after passport.session()
app.use(function (req, res, next) {
    if (req.user) {
        req.user.populate('groups', 'name', function (err, user) {
            if (err) { return next(err); }
            // or do we need the name or organization of the groups? At least name
            req.user = res.locals.active_user = user;
            req.is_member = res.locals.is_member = _.some(req.organization.member_group.members, function (member) {
                return member.user === req.user._id;
            });
            req.is_admin = res.locals.is_admin = _.some(req.organization.administration_group.members, function (member) {
                return member.user === req.user._id;
            });
            //User.find().select('username name').exec(function (err, all_users) {
                //if (err) { next(err); }
                //var indexed_users = _.indexBy(all_users, '_id');
                //var groups_of_users = _.reduce(req.user.groups, function (memo, group) {
                    //if (group) {
                        //console.log(group);
                        //return _.union(memo, _.map(group.members, function (member) {
                            //return member._id;
                        //}));
                    //} else {
                        //return memo;
                    //}
                //}, []);
                //// now an array of arrays: use union for now
                //req.user.friends = _.map(_.compact(groups_of_users), function (user_id) {
                    //return indexed_users[user_id];
                //});
            User.populate(req.user, 'friends', function (err) {
                if (err) { next(err); }
                next();
            });
            //});
        });
    } else {
        next();
    }
});

app.use(express.static(path.join(__dirname, '..' ,'public')));

// routes
app.post('/login',
         app.passport.authenticate('local', {
             failureRedirect: '/login',
             failureFlash: true
         }),
         persistentLogin,
         function(req, res){
             var url = req.session.returnTo || '/';
             delete req.session.returnTo;
             res.redirect(url);
         });

app.get('/auth/google', app.passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
]}));

app.get('/auth/google/callback', app.passport.authenticate('google', { failureRedirect: '/login' }), persistentLogin, function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

app.get('/auth/facebook', app.passport.authenticate('facebook'));

app.get('/auth/facebook/callback', app.passport.authenticate('facebook', {failureRedirect: '/login'}), persistentLogin, function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

app.get('/auth/twitter', app.passport.authenticate('twitter'));

app.get('/auth/twitter/callback', app.passport.authenticate('twitter', {failureRedirect: '/login'}), persistentLogin, function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

app.use('/', require('./routes/index'));
app.use('/proxy', require('./routes/proxy'));
app.use('/forum', require('./routes/forum'));
app.use('/files', require('./routes/files'));
app.use('/users', require('./routes/users'));
app.use('/groups', require('./routes/groups'));
app.use('/music', require('./routes/music'));

var project_routes = require('./routes/projects');
app.get('/events/public.ics', project_routes.ical_events);
app.get('/events/export.ics', project_routes.ical_events);
app.use('/events', require('./routes/events'));

var organization_routes = require('./routes/organization');
app.get('/members', organization_routes.memberlist);
//app.get('/organization/fill_dummy', organization_routes.fill_dummy);
app.get('/members/new', organization_routes.add_user);
app.post('/members/new', organization_routes.create_user);
//app.post('/members', organization_routes.add_group);
app.delete('/members/:groupid', organization_routes.remove_group);

app.post('/organization', organization_routes.add_instrument_group);
app.delete('/organization/:id', organization_routes.remove_instrument_group);
app.post('/organization/order', organization_routes.order_instrument_groups);
app.get('/contact', organization_routes.contacts);
app.get('/organization/edit', organization_routes.edit_organization);
app.post('/organization/edit', organization_routes.update_organization);
app.get('/organization/updated_email_lists.json/:groups', organization_routes.encrypted_mailman_lists);
app.put('/organization/admin/admin_group', organization_routes.set_admin_group);
app.put('/organization/admin/musicscoreadmin_group', organization_routes.set_musicscoreadmin_group);

app.get('/projects', project_routes.index);
app.post('/projects', project_routes.create_project);
//app.get('/:year(\\d{4})', project_routes.year);
app.get('/:year(\\d{4})/:tag', project_routes.project);
app.put('/projects/:id', project_routes.update_project);
app.delete('/projects/:id', project_routes.delete_project);
app.post('/projects/:id/events', project_routes.project_create_event);
app.post('/projects/:id/forum', project_routes.project_create_post);
app.delete('/projects/:project_id/forum/:post_id', project_routes.project_delete_post);
app.post('/projects/:id/files', upload, project_routes.project_create_file);
app.put('/projects/:id/poster', project_routes.set_poster);
app.put('/projects/:project_id/music', project_routes.add_piece);
app.delete('/projects/:project_id/music', project_routes.remove_piece);

app.use('/', require('./routes/pages'));

// 500 status
/*jshint unused: vars*/
/*jslint unparam: true*/
app.use(function(err, req, res, next){
    console.error("ERR:", err.message, err.stack);
    res.status(500);
    res.format({
        html: function(){
            res.render('500', {
                error: err.message,
                status: err.status || 500
            });
        },

        json: function(){
            res.status(500).json({
                error: err.message,
                status: err.status || 500
            });
        }
    });
});

// 404 status
app.use(function(req, res){
    res.status(404);
    res.format({
        html: function(){
            res.render('404', {
                status: 404,
                error: 'file not found',
                url: req.url
            });
        },

        json: function(){
            res.status(404).json({
                status: '404',
                error: 'file not found',
                url: req.url
            });
        }
    });
});

module.exports = app;
