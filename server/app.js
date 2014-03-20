var _           = require('underscore'),
    express     = require('express'),
    path        = require('path'),
    multer      = require('multer'),
    marked      = require('marked'),
    moment      = require('moment'),
    settings    = require('./settings'),
    util        = require('./lib/util'),
    app         = require('libby')(express, settings);

var User = require('./models/index').User,
    Group = require('./models/index').Group,
    Organization = require('./models/index').Organization;

app.passport = require('./lib/passport')(app);
app.ensureAuthenticated = require('./lib/middleware').ensureAuthenticated;

app.configure(function(){

    // set jade as template engine
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // initialize passport
    app.use(app.passport.initialize());
    app.use(app.passport.session());

    // utils
    app.use(function (req, res, next) {
        res.locals.hoid = util.h2b64;
        res.locals.marked = marked;
        res.locals.moment = moment;
        res.locals.isodate = util.isodate;
        res.locals.shortdate = util.shortdate;
        res.locals.longdate = util.longdate;
        res.locals.ago = util.ago;
        next();
    });

    // has to go after passport.session()
    app.use(function (req, res, next) {
        if (req.user) {
            Group.populate(req.user, 'groups', function (err, user) {
                req.user = res.locals.active_user = user;
                // TODO: User redis for caching
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
                    User.populate(req.user, 'friends', function (err, user) {
                        if (err) { next(err); }
                        next();
                    });
                //});
            });
        } else {
            next();
        }
    });
    app.use(function (req, res, next) {
        Organization.findById('nidarholm', function (err, organization) {
            if (err) { next(err); }
            if (organization) {
                req.organization = organization;
                res.locals.organization = organization;
                next();
            } else {
                var group = new Group();
                group.name = 'Medlemmer';
                group.save(function (err) {
                    if (err) { next(err); }

                    organization = new Organization();
                    organization._id = 'nidarholm';
                    organization.instrument_groups = [];
                    organization.administration_groups = [];
                    organization.member_group = group;

                    organization.save(function (err) {
                        group.organization = organization;
                        group.save(function (err) {
                            req.organization = organization;
                            res.locals.organization = organization;
                            next();
                        });
                    });
                });
            }
        });
    });

    app.use(multer());
    // middleware changing req or res should come before this
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '..' ,'public')));

    // 500 status
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
                res.json(500, {
                    error: err.message,
                    status: err.status || 500
                });
            }
        });
    });

    // 404 status
    app.use(function(req, res, next){
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
                res.json(404, {
                    status: '404',
                    error: 'file not found',
                    url: req.url
                });
            }
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
app.get('/forum', forum_routes.index);
app.get(/^\/forum\/tags\/(.+)/, forum_routes.index);
app.get('/forum/:id', forum_routes.get_post);
app.get('/forum/:id/replies', forum_routes.get_replies);
app.post('/forum', forum_routes.create_post);
app.delete('/forum/:id', forum_routes.delete_post);
app.post('/forum/:postid/replies', forum_routes.create_reply);
app.delete('/forum/:postid/replies/:replyid', forum_routes.delete_reply);
app.post('/forum/:postid/replies/:replyid/comments', forum_routes.create_comment);
app.delete('/forum/:postid/replies/:replyid/comments/:commentid', forum_routes.delete_comment);

var organization_routes = require('./routes/organization');
app.get('/members', organization_routes.memberlist);
//app.get('/organization/fill_dummy', organization_routes.fill_dummy);
app.get('/members/new', organization_routes.add_user);
app.post('/members/new', organization_routes.create_user);
//app.post('/members', organization_routes.add_group);
app.delete('/members/:groupid', organization_routes.remove_group);

app.get('/users', organization_routes.users);
app.get('/users/:username', organization_routes.user);
app.get('/users/:username/edit', organization_routes.edit_user);
app.post('/users/:id/edit', organization_routes.update_user);
app.post('/users/:username/picture', organization_routes.upload_profile_picture);
app.put('/users/:username/picture/:id', organization_routes.set_profile_picture);
app.post('/users/:username/groups', organization_routes.user_add_group);
app.delete('/users/:username/groups/:groupid', organization_routes.user_remove_group);

app.get('/groups', organization_routes.groups);
app.post('/groups', organization_routes.add_group);
app.get('/groups/:id', organization_routes.group);
app.post('/groups/:id/users', organization_routes.group_add_user);
app.delete('/groups/:groupid/users/:username', organization_routes.group_remove_user);
app.post('/organization', organization_routes.add_instrument_group);
app.delete('/organization/:id', organization_routes.remove_instrument_group);
app.post('/organization/order', organization_routes.order_instrument_groups);

var file_routes = require('./routes/files');
app.get('/files', file_routes.all);
app.get('/files/new', file_routes.index);
app.post('/files/upload', file_routes.upload);
app.put('/files/:id', file_routes.update);
app.get('/files/:id', file_routes.show_file);
app.get('/files/:path/:filename', file_routes.raw_file);

var project_routes = require('./routes/projects');
app.get('/projects', project_routes.index);
app.post('/projects', project_routes.create_project);
app.delete('/projects/:id', project_routes.delete_project);
app.get('/projects/:id', project_routes.project);
app.post('/projects/:id/events', project_routes.project_create_event);
app.delete('/projects/:project_id/events/:event_id', project_routes.project_delete_event);
app.post('/projects/:id/forum', project_routes.project_create_post);
app.delete('/projects/:project_id/forum/:post_id', project_routes.project_delete_post);
app.post('/projects/:id/files', project_routes.project_create_file);
app.get('/events', project_routes.events);

var proxy_routes = require('./routes/proxy');
app.get('/proxy/postcode/:postcode', proxy_routes.postcode);

app.get('/foundation', function(req, res){
    res.render('foundation');
});

module.exports = app;
