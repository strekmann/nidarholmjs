#!/usr/bin/env node

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import errorHandler from 'errorhandler';
import express from 'express';
import http from 'http';
import expressBunyan from 'express-bunyan-logger';
import path from 'path';
//import socketIO from 'socket.io';
//import passportSocketIO from 'passport.socketio';
import config from 'config';
import serveStatic from 'serve-static';
import connectRedis from 'connect-redis';
import Immutable from 'immutable';
import moment from 'moment';

import passport from './lib/passport';
import api from './api';
import universal from './app';
//import socketRoutes from './socket';
import log from './lib/logger';
import { User } from './models';
import './lib/db';

import graphqlHTTP from 'express-graphql';
import schema from './api/schema';

//import * as profileAPI from './server/api/profile';

const app = express();
const httpServer = http.createServer(app);
const port = config.get('express.port') || 3000;
//const io = socketIO(httpServer, { path: '/s' });

if (config.get('express.trust_proxy')) {
    app.enable('trust proxy');
}

app.use(cookieParser(config.get('session.cookiesecret')));

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
//io.use(passportSocketIO.authorize(socketOptions));

app.use(passport.initialize());
app.use(passport.session());
if (config.auth.remember_me) {
    app.use(passport.authenticate('remember-me'));
}

app.use('/graphql', graphqlHTTP(req => ({
    schema,
    rootValue: { viewer: req.user },
    pretty: process.env.NODE_ENV !== 'production',
    graphiql: process.env.NODE_ENV !== 'production',
})));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** Socket.io routes **/
//socketRoutes(io);

/** Authentication stuff **/
app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'],
        }), (req, res) => {
            // do nothing
        });
app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
            const url = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(url);
        });

app.get('/auth/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

app.post('/auth/login', passport.authenticate('local'), (req, res, next) => {
    res.format({
        html: () => {
            res.redirect('/');
        },
        json: () => {
            res.json({ user: req.user });
        },
    });
});

app.post('/auth/register', (req, res, next) => {
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const password = req.body.password;  // should not trim this

    // simple validation
    if (!name || !email || !password) {
        return next(new Error('All fields are needed'));
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = password;
    return user.save((err, createdUser) => {
        if (err) { return next(err); }

        // let the new user be logged in
        return req.logIn(createdUser, (err) => {
            if (err) { return next(err); }

            return res.format({
                html: () => res.redirect('/'),
                json: () => res.json({ user: createdUser }),
            });
        });
    });
});

/** API endpoints **/
app.use('/api/1/auth', api.auth);

/** Static stuff **/
app.use(serveStatic(path.join(__dirname, '..', '..', 'dist', 'public')));

/** Initial store data **/
app.use((req, res, next) => {
    res.store = {};
    res.store.viewer = {};
    res.store.viewer.formErrors = [];

    // Using JSON stringify and parse to make sure server data is similar to client data.
    if (req.user) {
        res.store.viewer = Immutable.fromJS(req.user.toObject());
        res.store.users = {};
        res.store.users[req.user.id] = JSON.parse(JSON.stringify(req.user));
    }
    next();
});

/** Universal app endpoint **/
app.get('*', universal);

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

process.on('uncaughtException', (err) => {
    log.fatal(err);
    process.exit(1);
});

httpServer.listen(port, () => {
    log.info('port %s, env=%s', port, config.util.getEnv('NODE_ENV'));
});
