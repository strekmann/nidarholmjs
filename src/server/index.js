#!/usr/bin/env node

/* eslint no-param-reassign: "off" */
/* eslint camelcase: "off" */

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import errorHandler from 'errorhandler';
import express from 'express';
import fs from 'fs';
import http from 'http';
import httpProxy from 'http-proxy';
import mongoose from 'mongoose';
import bunyan from 'bunyan';
import expressBunyan from 'express-bunyan-logger';
import path from 'path';
// import socketIO from 'socket.io';
// import passportSocketIO from 'passport.socketio';
import config from 'config';
import serveStatic from 'serve-static';
import connectMongo from 'connect-mongo';
import multer from 'multer';
import graphqlHTTP from 'express-graphql';

import passport from './lib/passport';
// import api from './api';
import universal from './app';
// import socketRoutes from './socket';
import { icalEvents } from './icalRoutes';
import Organization from './models/Organization';
import './lib/db';
import saveFile from './lib/saveFile';
import findFilePath from './lib/findFilePath';

// import project_routes from './routes/projects';
// import organization_routes from './routes/organization';
import persistentLogin from './lib/persistentLoginMiddleware';

import schema from './schema';

// import * as profileAPI from './server/api/profile';

const app = express();
const httpServer = http.createServer(app);
const port = config.get('express.port') || 3000;
const upload = multer({ storage: multer.diskStorage({}) }).single('file');

// const io = socketIO(httpServer, { path: '/s' });

/*
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
*/

if (config.get('express.trust_proxy')) {
    app.set('trust proxy', 1);
}

app.use(cookieParser(config.get('express.session.secret')));
//app.use(flash());

if (config.util.getEnv('NODE_ENV') === 'test') {
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true,
    }));
    app.use(session({
        secret: 'testing-secret',
        resave: config.get('express.session.resave'),
        saveUninitialized: config.get('express.session.saveUninitialized'),
    }));
}

const MongoStore = connectMongo(session);

app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: config.get('express.session.maxAge') / 1000,
        touchAfter: config.get('express.session.maxAge') / 10000,
    }),
    secret: config.get('express.session.secret'),
    name: config.get('express.session.name'),
    resave: config.get('express.session.resave'),
    saveUninitialized: config.get('express.session.saveUninitialized'),
    rolling: config.get('express.session.rolling'),
    maxAge: config.get('express.session.maxAge'),
    httpOnly: false,
    cookie: {
        maxAge: config.get('express.session.maxAge'),
        secure: config.get('express.session.secure'),
    },
    sameSite: 'strict',
}));

/* LOGGING */
const log = bunyan.createLogger(config.get('bunyan'));
const bunyan_opts = {
    logger: log,
    excludes: config.get('bunyan-express').excludes,
    format: config.get('bunyan-express').format,
};
app.use(expressBunyan(bunyan_opts));
app.use(expressBunyan.errorLogger(bunyan_opts));

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
app.use(serveStatic(path.join(__dirname, '..', 'static')));

/** GraphQL **/
app.use('/graphql', graphqlHTTP(req => {
    const contextValue = { viewer: req.user, organization: req.organization, file: req.file };
    return {
        schema,
        rootValue: contextValue,
        context: contextValue,
        pretty: process.env.NODE_ENV !== 'production',
        graphiql: process.env.NODE_ENV !== 'production',
    };
}));

app.post('/upload', upload, (req, res, next) => {
    // FIXME: Add check on org membership
    return saveFile(req.file.path, config.files.raw_prefix).then(
        _file => res.json(_file)
    )
    .catch(error => {
        console.error(error);
    });
});


app.get('/files/l/:path/:filename', (req, res) => {
    const filepath = req.params.path;
    const fullpath = path.join(
        findFilePath('large'),
        filepath.substr(0, 2),
        filepath.substr(2, 2),
        filepath,
    );

    fs.exists(fullpath, (exists) => {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

app.get('/files/n/:path/:filename', (req, res) => {
    const filepath = req.params.path;
    const fullpath = path.join(
        findFilePath('normal'),
        filepath.substr(0, 2),
        filepath.substr(2, 2),
        filepath,
    );

    fs.exists(fullpath, (exists) => {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

app.get('/files/th/:path/:filename', (req, res) => {
    const filepath = req.params.path;
    const fullpath = path.join(
        findFilePath('thumbnails'),
        filepath.substr(0, 2),
        filepath.substr(2, 2),
        filepath,
    );

    fs.exists(fullpath, (exists) => {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

app.get('/events/public.ics', icalEvents);
app.get('/events/export.ics', icalEvents);

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

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.clearCookie('remember_me');
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

// app.use('/', require('./routes/index'));
// app.use('/proxy', require('./routes/proxy'));
// app.use('/forum', require('./routes/forum'));

app.get('/files', universal);
// app.use('/files', require('./routes/files'));

app.use('/users/:username', universal);
// app.use('/users', require('./routes/users'));
// app.use('/groups', require('./routes/groups'));

app.get('/music/:pieceId', universal);
app.get('/music', universal);
// app.use('/music', require('./routes/music'));

// app.get('/events/public.ics', project_routes.ical_events);
// app.get('/events/export.ics', project_routes.ical_events);
app.get('/events/:eventid', universal);
app.get('/events', universal);
// app.use('/events', require('./routes/events'));

// app.get('/members', organization_routes.memberlist);
app.get('/members', universal);
// app.get('/organization/fill_dummy', organization_routes.fill_dummy);
// app.get('/members/new', organization_routes.add_user);
// app.post('/members/new', organization_routes.create_user);
// app.post('/members', organization_routes.add_group);
// app.delete('/members/:groupid', organization_routes.remove_group);

// app.post('/organization', organization_routes.add_instrument_group);
// app.delete('/organization/:id', organization_routes.remove_instrument_group);
// app.post('/organization/order', organization_routes.order_instrument_groups);
// app.get('/contact', organization_routes.contacts);
// app.get('/organization/edit', organization_routes.edit_organization);
// app.post('/organization/edit', organization_routes.update_organization);
/*
app.get(
    '/organization/updated_email_lists.json/:groups',
    organization_routes.encrypted_mailman_lists,
);
*/
// app.put('/organization/admin/admin_group', organization_routes.set_admin_group);
// app.put('/organization/admin/musicscoreadmin_group', organization_routes.set_musicscoreadmin_group);

// app.get('/projects', project_routes.index);
app.get('/projects', universal);
// app.post('/projects', project_routes.create_project);
// app.get('/:year(\\d{4})', project_routes.year);
// app.get('/:year(\\d{4})/:tag', project_routes.project);
// app.get('/:year(\\d{4})/:tag', universal);
// app.put('/projects/:id', project_routes.update_project);
// app.delete('/projects/:id', project_routes.delete_project);
// app.post('/projects/:id/events', project_routes.project_create_event);
// app.post('/projects/:id/forum', project_routes.project_create_post);
// app.delete('/projects/:project_id/forum/:post_id', project_routes.project_delete_post);
// app.post('/projects/:id/files', upload, project_routes.project_create_file);
// app.put('/projects/:id/poster', project_routes.set_poster);
// app.put('/projects/:project_id/music', project_routes.add_piece);
// app.delete('/projects/:project_id/music', project_routes.remove_piece);

// app.use('/', require('./routes/pages'));
app.use('/', universal);

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
