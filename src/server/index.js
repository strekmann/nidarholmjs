#!/usr/bin/env node

/* eslint no-param-reassign: "off" */
/* eslint camelcase: "off" */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import errorHandler from 'errorhandler';
import express from 'express';
import http from 'http';
import flash from 'connect-flash';
import httpProxy from 'http-proxy';
import expressBunyan from 'express-bunyan-logger';
import path from 'path';
// import socketIO from 'socket.io';
// import passportSocketIO from 'passport.socketio';
import config from 'config';
import serveStatic from 'serve-static';
import connectRedis from 'connect-redis';
import moment from 'moment';
import multer from 'multer';
import marked from 'marked';
import graphqlHTTP from 'express-graphql';
import _, { some } from 'lodash';

import passport from './lib/passport';
// import api from './api';
import universal from './app';
// import socketRoutes from './socket';
import log from './lib/logger';
import { User, Organization, Group } from './models';
import './lib/db';
import {
    isodate,
    simpledate,
    shortdate,
    longdate,
    ago,
    daterange,
    prettyhost,
    phoneformat,
} from './lib/util';

import project_routes from './routes/projects';
import organization_routes from './routes/organization';
import { persistentLogin } from './lib/middleware';

import schema from './api/schema';

// import * as profileAPI from './server/api/profile';

const app = express();
const httpServer = http.createServer(app);
const port = config.get('express.port') || 3000;
const upload = multer({ storage: multer.diskStorage({}) }).single('file');

// const io = socketIO(httpServer, { path: '/s' });

function get_member_group() {
    return Group.findOne({ name: 'Medlemmer' })
    .then((group) => {
        if (!group) {
            group = new Group();
            group._id = 'medlemmer';
            group.name = 'Medlemmer';
            return group.save();
        }
        return group;
    });
}

if (config.get('express.trust_proxy')) {
    app.enable('trust proxy');
}

app.use(cookieParser(config.get('session.cookiesecret')));
app.use(flash());

if (config.util.getEnv('NODE_ENV') !== 'test') {
    const bunyanOpts = {
        logger: log,
        excludes: ['req', 'res', 'req-headers', 'res-headers'],
    };
    app.use(expressBunyan(bunyanOpts));
    app.use(expressBunyan.errorLogger(bunyanOpts));
}
else {
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true,
    }));
    app.use(session({
        secret: 'testing-secret',
        resave: config.get('session.resave'),
        saveUninitialized: config.get('sessopn.saveUninitialized'),
    }));
}

const RedisStore = connectRedis(session);
const redisStoreOpts = config.get('redis');
redisStoreOpts.ttl = config.get('session.ttl') / 1000;
const sessionStore = new RedisStore(redisStoreOpts);

app.use(session({
    store: sessionStore,
    secret: config.get('session.secret'),
    name: config.get('session.name'),
    resave: config.get('session.resave'),
    saveUninitialized: config.get('session.saveUninitialized'),
    rolling: config.get('session.rolling'),
    cookie: {
        maxAge: config.get('session.ttl'),
    },
}));

/*
const socketOptions = {
    store: sessionStore,
    key: config.get('session.name'),
    secret: config.get('session.secret'),
    cookieParser,
    success: (data, accept) => {
        log.debug('successful auth');
        accept();
    },
    fail: (data, message, error, accept) => {
        log.debug('auth failed', message);
        accept(new Error(message));
    },
};
*/
// io.use(passportSocketIO.authorize(socketOptions));

app.use(passport.initialize());
app.use(passport.session());
if (config.auth.remember_me) {
    app.use(passport.authenticate('remember-me'));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// utils
app.use((req, res, next) => {
    moment.locale('nb'); // has to come before the next functions
    res.locals.stamp = app.stamp;
    res.locals._ = _;
    res.locals.marked = marked;
    res.locals.moment = moment;
    res.locals.isodate = isodate;
    res.locals.simpledate = simpledate;
    res.locals.shortdate = shortdate;
    res.locals.longdate = longdate;
    res.locals.ago = ago;
    res.locals.daterange = daterange;
    res.locals.prettyhost = prettyhost;
    res.locals.phoneformat = phoneformat;
    return next();
});

// init org
// NEW
// Fetch active organization from hostname, config override
// or pick the default.
app.use((req, res, next) => {
    let organizationId = req.hostname;
    if (config.override && config.override.site) {
        organizationId = config.override.site;
    }
    if (organizationId === 'localhost') {
        // TODO: Change this part for samklang.
        organizationId = 'nidarholm';
    }
    Organization.findById(organizationId)
    .populate('member_group')
    .populate('administration_group')
    .exec((err, organization) => {
        if (err) { return next(err); }
        req.organization = res.locals.organization = organization;
        return next();
    });
    if (req.user) {
        res.locals.active_user = req.user;
    }
});

/*
app.use((req, res, next) => {
    Organization.findById('nidarholm')
    .populate('member_group')
    .populate('administration_group') // no need to select fields, ids only
    .exec((err, organization) => {
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
            res.locals.address = `${req.protocol}://${organization.webdomain}`;
            res.locals.path = req.path;
            return next();
        }
        return get_member_group().then((group) => {
            organization = new Organization();
            organization._id = 'nidarholm';
            organization.webdomain = 'nidarholm.no';
            organization.instrument_groups = [];
            organization.member_group = group;

            return organization.save((err) => {
                if (err) { return next(err); }
                group.organization = organization;
                return group.save((err) => {
                    if (err) { return next(err); }
                    req.organization = res.locals.organization = organization;
                    if (!organization.description) {
                        organization.description = {};
                    }
                    if (!organization.administration_group) {
                        organization.administration_group = organization.member_group;
                    }
                    res.locals.address = `${req.protocol}://${organization.webdomain}`;
                    res.locals.path = req.path;
                    return next();
                });
            });
        });
    });
});
*/
// has to go after passport.session()
/*
app.use((req, res, next) => {
    if (req.user) {
        req.user.populate('groups', 'name', (err, user) => {
            if (err) { return next(err); }
            // or do we need the name or organization of the groups? At least name
            req.user = res.locals.active_user = user;
            req.is_member = res.locals.is_member = some(
                req.organization.member_group.members,
                (member) => member.user === req.user._id,
            );
            req.is_admin = res.locals.is_admin = some(
                req.organization.administration_group.members,
                (member) => member.user === req.user._id,
            );
            return User.populate(req.user, 'friends', (err) => {
                if (err) { return next(err); }
                return next();
            });
        });
    }
    return next();
});
*/

/** Static stuff **/
app.use(serveStatic(path.join(__dirname, '..', '..', 'dist', 'public')));

/** GraphQL **/
app.use('/graphql', graphqlHTTP(req => ({
    schema,
    rootValue: { viewer: req.user, organization: req.organization },
    pretty: process.env.NODE_ENV !== 'production',
    graphiql: process.env.NODE_ENV !== 'production',
})));

/** Socket.io routes **/
// socketRoutes(io);

if (process.env.NODE_ENV !== 'production') {
    const proxy = httpProxy.createProxyServer();
    app.all('/js/*', (req, res) => {
        proxy.web(req, res, {
            target: 'http://localhost:3001',
        });
    });
}

/** Authentication stuff **/
app.get('/auth/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

app.post(
    '/auth/login',
    passport.authenticate('local'),
    persistentLogin,
    (req, res, next) => {
        res.redirect('/');
    }
);

// routes
app.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    }),
    persistentLogin,
    (req, res) => {
        const url = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(url);
    },
);

app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] }),
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    persistentLogin, (req, res) => {
        const url = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(url);
    },
);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    persistentLogin,
    (req, res) => {
        const url = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(url);
    },
);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    persistentLogin,
    (req, res) => {
        const url = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(url);
    },
);

app.get('/', universal);
app.get('/about', universal);
app.get('/login', universal);

app.use('/', require('./routes/index'));
app.use('/proxy', require('./routes/proxy'));
app.use('/forum', require('./routes/forum'));
app.use('/files', require('./routes/files'));
app.use('/users', require('./routes/users'));
app.use('/groups', require('./routes/groups'));
app.use('/music', require('./routes/music'));

app.get('/events/public.ics', project_routes.ical_events);
app.get('/events/export.ics', project_routes.ical_events);
app.use('/events', require('./routes/events'));

app.get('/members', organization_routes.memberlist);
// app.get('/organization/fill_dummy', organization_routes.fill_dummy);
app.get('/members/new', organization_routes.add_user);
app.post('/members/new', organization_routes.create_user);
// app.post('/members', organization_routes.add_group);
app.delete('/members/:groupid', organization_routes.remove_group);

app.post('/organization', organization_routes.add_instrument_group);
app.delete('/organization/:id', organization_routes.remove_instrument_group);
app.post('/organization/order', organization_routes.order_instrument_groups);
app.get('/contact', organization_routes.contacts);
app.get('/organization/edit', organization_routes.edit_organization);
app.post('/organization/edit', organization_routes.update_organization);
app.get(
    '/organization/updated_email_lists.json/:groups',
    organization_routes.encrypted_mailman_lists,
);
app.put('/organization/admin/admin_group', organization_routes.set_admin_group);
app.put('/organization/admin/musicscoreadmin_group', organization_routes.set_musicscoreadmin_group);

// app.get('/projects', project_routes.index);
app.get('/projects', universal);
app.post('/projects', project_routes.create_project);
// app.get('/:year(\\d{4})', project_routes.year);
// app.get('/:year(\\d{4})/:tag', project_routes.project);
app.get('/:year(\\d{4})/:tag', universal);
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

/** API endpoints **/
// app.use('/api/1/auth', api.auth);

/** Universal app endpoint **/
app.get('*', universal);

/*
app.use((err, req, res, next) => {
    log.error(err);
    res.format({
        html: () => {
            res.sendStatus(500);
        },
        json: () => {
            res.status(500).json({
                error: err.message,
            });
        },
    });
});
*/

/*
app.use((req, res, next) => {
    res.format({
        html: () => {
            res.sendStatus(404);
        },
        json: () => {
            res.status(404).json({
                error: 'Not Found',
                status: 404,
            });
        },
    });
});
*/

process.on('uncaughtException', (err) => {
    log.fatal(err);
    process.exit(1);
});

httpServer.listen(port, () => {
    log.info('port %s, env=%s', port, config.util.getEnv('NODE_ENV'));
});
