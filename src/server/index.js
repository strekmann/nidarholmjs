#!/usr/bin/env node

/* eslint no-param-reassign: "off" */
/* eslint camelcase: "off" */

import fs from "fs";
import http from "http";
import path from "path";

import config from "config";
import "regenerator-runtime/runtime";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import errorHandler from "errorhandler";
import express from "express";
import httpProxy from "http-proxy";
import mongoose from "mongoose";
import bunyan from "bunyan";
import expressBunyan from "express-bunyan-logger";
import serveStatic from "serve-static";
import connectMongo from "connect-mongo";
import moment from "moment";
import multer from "multer";
import graphqlHTTP from "express-graphql";
import { getFarceResult } from "found/lib/server";
import jwt from "jsonwebtoken";
import { ExtractJwt } from "passport-jwt";

import { ServerFetcher } from "../fetcher";
import {
  createResolver,
  historyMiddlewares,
  render,
  routeConfig,
} from "../router";

import renderPage from "./renderPage";
import passport from "./lib/passport";
import { icalEvents } from "./icalRoutes";
import { downloadArchive } from "./musicRoutes";
import Organization from "./models/Organization";
import PasswordCode from "./models/PasswordCode";
import User from "./models/User";
import "./lib/db";
import saveFile from "./lib/saveFile";
import findFilePath from "./lib/findFilePath";
import persistentLogin from "./lib/persistentLoginMiddleware";
import { groupEmailApiRoute, roleEmailApiRoute } from "./lib/emailApi";
import schema from "./schema";

// import * as profileAPI from './server/api/profile';

const app = express();
const httpServer = http.createServer(app);
const port = config.get("express.port") || 3000;

const upload = multer({ storage: multer.diskStorage({}) }).single("file");

// const io = socketIO(httpServer, { path: '/s' });

if (config.get("express.trust_proxy")) {
  app.set("trust proxy", 1);
}

app.use(cookieParser(config.get("express.session.secret")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (config.util.getEnv("NODE_ENV") === "test") {
  app.use(
    errorHandler({
      dumpExceptions: true,
      showStack: true,
    }),
  );
  app.use(
    session({
      secret: "testing-secret",
      resave: config.get("express.session.resave"),
      saveUninitialized: config.get("express.session.saveUninitialized"),
    }),
  );
}

const MongoStore = connectMongo(session);

app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: config.get("express.session.maxAge") / 1000,
      touchAfter: config.get("express.session.maxAge") / 10000,
    }),
    secret: config.get("express.session.secret"),
    name: config.get("express.session.name"),
    resave: config.get("express.session.resave"),
    saveUninitialized: config.get("express.session.saveUninitialized"),
    rolling: config.get("express.session.rolling"),
    maxAge: config.get("express.session.maxAge"),
    httpOnly: false,
    cookie: {
      maxAge: config.get("express.session.maxAge"),
      secure: config.get("express.session.secure"),
    },
    sameSite: "strict",
  }),
);

/* LOGGING */
const log = bunyan.createLogger(config.get("bunyan"));
const bunyan_opts = {
  logger: log,
  excludes: config.get("bunyan-express").excludes,
  format: config.get("bunyan-express").format,
};
app.use(expressBunyan(bunyan_opts));
app.use(expressBunyan.errorLogger(bunyan_opts));

app.use(passport.initialize());
app.use(passport.session());
if (config.auth.remember_me) {
  app.use(passport.authenticate("remember-me"));
}
if (config.auth.jwt) {
  // Alternative authentication through authenticate bearer header and jwt.
  // Still allows anonymous requests, it just does not set req.user.
  app.use((req, res, next) => {
    if (req.user) {
      return next();
    }
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return next();
    }
    return jwt.verify(
      token,
      config.express.session.secret,
      {},
      (error, decoded) => {
        if (error) {
          log.error(error);
          return next();
        }
        if (!decoded.sub) {
          // no sub in token
          return next();
        }
        return passport.deserializeUser(decoded.sub.id, (err, user) => {
          if (err) {
            log.error(err);
          } else if (user) {
            req.user = user;
          }
          return next();
        });
      },
    );
  });
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

/* Static stuff */
app.use(serveStatic(path.join(__dirname, "..", "static")));

// We have a possibility to override user login during development
app.use((req, res, next) => {
  if (
    process.NODE_ENV !== "production" &&
    config.override &&
    config.override.user
  ) {
    User.findOne({ email: config.override.user })
      .exec()
      .then((user) => {
        req.user = user;
        next();
      });
  } else {
    next();
  }
});

// Fetch active organization from hostname, config override
// or pick the default.
app.use((req, res, next) => {
  let organizationId = req.hostname;
  if (config.override && config.override.site) {
    organizationId = config.override.site;
  }
  if (organizationId === "localhost") {
    // TODO: Change this part for samklang.
    organizationId = "nidarholm";
  }
  Organization.findById(organizationId)
    .populate("member_group")
    .populate("administration_group")
    .populate("musicscoreadmin_group")
    .exec((err, organization) => {
      if (err) {
        return next(err);
      }
      req.organization = organization.toObject();
      if (req.user) {
        req.user.isMember = req.user.groups.includes(
          req.organization.member_group.id,
        );
        req.user.isAdmin = req.user.groups.includes(
          req.organization.administration_group.id,
        );
        req.user.isMusicAdmin = req.user.groups.includes(
          req.organization.musicscoreadmin_group.id,
        );
        req.organization.user = req.user.toObject();
      }
      return next();
    });
});

/* GraphQL */
app.use(
  "/graphql",
  graphqlHTTP((req) => {
    const contextValue = {
      viewer: req.user,
      organization: req.organization,
      file: req.file,
    };
    return {
      schema,
      rootValue: contextValue,
      context: contextValue,
      pretty: process.env.NODE_ENV !== "production",
      graphiql: process.env.NODE_ENV !== "production",
    };
  }),
);

app.post("/upload", upload, (req, res, next) => {
  // TODO: Add check on org membership
  return saveFile(req.file.path, config.files.raw_prefix)
    .then((_file) => {
      return res.json(_file);
    })
    .catch((error) => {
      log.error(error);
    });
});

app.get("/organization/updated_email_lists.json/:groups", groupEmailApiRoute);
app.get("/organization/role_aliases.json", roleEmailApiRoute);

app.get("/files/l/:path/:filename", (req, res) => {
  const filepath = req.params.path;
  const fullpath = path.join(
    findFilePath("large"),
    filepath.substr(0, 2),
    filepath.substr(2, 2),
    filepath,
  );

  fs.exists(fullpath, (exists) => {
    if (exists) {
      res.sendFile(fullpath);
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/files/n/:path/:filename", (req, res) => {
  const filepath = req.params.path;
  const fullpath = path.join(
    findFilePath("normal"),
    filepath.substr(0, 2),
    filepath.substr(2, 2),
    filepath,
  );

  fs.exists(fullpath, (exists) => {
    if (exists) {
      res.sendFile(fullpath);
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/files/th/:path/:filename", (req, res) => {
  const filepath = req.params.path;
  const fullpath = path.join(
    findFilePath("thumbnails"),
    filepath.substr(0, 2),
    filepath.substr(2, 2),
    filepath,
  );

  fs.exists(fullpath, (exists) => {
    if (exists) {
      res.sendFile(fullpath);
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/files/o/:path/:filename", (req, res) => {
  const filepath = req.params.path;
  const fullpath = path.join(
    findFilePath("originals"),
    filepath.substr(0, 2),
    filepath.substr(2, 2),
    filepath,
  );

  fs.exists(fullpath, (exists) => {
    if (exists) {
      res.sendFile(fullpath);
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/events/public.ics", icalEvents);
app.get("/events/export.ics", icalEvents);

app.get("/music/archive.xlsx", downloadArchive);

/* Socket.io routes */
// socketRoutes(io);

if (process.env.NODE_ENV !== "production") {
  const proxy = httpProxy.createProxyServer();
  app.all("/js/*", (req, res) => {
    proxy.web(req, res, {
      target: "http://localhost:3001",
    });
  });
}

/* Authentication stuff */
app.get("/logout", (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.clearCookie("remember_me");
  res.redirect("/");
});

app.post(
  "/login",
  passport.authenticate("local"),
  persistentLogin,
  (req, res, next) => {
    res.redirect("/");
  },
);

app.get("/login/reset/:code", (req, res, next) => {
  return PasswordCode.findById(req.params.code)
    .exec()
    .then((passwordCode) => {
      if (
        !passwordCode ||
        passwordCode.created < moment().subtract(1, "hours")
      ) {
        return res.redirect("/login/reset");
      }
      return User.findById(passwordCode.user)
        .exec()
        .then((user) => {
          req.logIn(user, (err) => {
            if (err) {
              throw err;
            }
            // TODO: return res.redirect(`/user/${user.id}/reset`);
            return res.redirect("/");
          });
        });
    });
});

app.post("/login/register", (req, res, next) => {
  const email = req.body.email.trim();
  const name = req.body.name.trim();
  if (email && name && req.body.password) {
    const user = new User();
    user.email = email;
    user.name = name;
    user.username = email;
    const hashedPassword = user.hashPassword(req.body.password);
    user.password = hashedPassword.hashedPassword;
    user.algorithm = hashedPassword.algorithm;
    user.salt = hashedPassword.salt;
    return user.save().then((newUser) => {
      req.logIn(newUser, (err) => {
        if (err) {
          throw err;
        }
        return res.redirect("/");
      });
    });
  }
  return res.redirect("/login");
});

app.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/userinfo.profile"],
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const url = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(url);
  },
);

app.get("/login/facebook", passport.authenticate("facebook"));

app.get(
  "/login/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const url = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(url);
  },
);

app.get("/login/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  persistentLogin,
  (req, res) => {
    const url = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(url);
  },
);

// Send remaining requests to React frontend route matcher
app.use(async (req, res, next) => {
  const token = jwt.sign(
    {
      sub: req.user,
      aud: config.get("site.domain"),
      iss: config.get("site.domain"),
    },
    config.get("express.session.secret"),
  );
  const fetcher = new ServerFetcher(`http://localhost:${port}/graphql`, token);
  try {
    const { redirect, status, element } = await getFarceResult({
      url: req.url,
      historyMiddlewares,
      routeConfig,
      resolver: createResolver(fetcher),
      render,
    });

    if (redirect) {
      res.redirect(302, redirect.url);
      return;
    }

    res
      .status(status)
      .send(renderPage(element, fetcher, req.headers["user-agent"]));
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  let status = 500;
  let message = err.message || err;

  switch (err.name) {
    case "UnauthorizedError":
      status = 401;
      message = "Invalid token";
      break;
    default:
      log.error(err, "unhandeled error");
  }

  res.format({
    html: () => {
      res.status(status).send(message);
    },
    json: () => {
      res.status(status).json({
        error: message,
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
        error: "Not Found",
        status: 404,
      });
    },
  });
});

process.on("uncaughtException", (err) => {
  log.fatal(err);
  process.exit(1);
});

httpServer.listen(port, () => {
  log.info("port %s, env=%s", port, config.util.getEnv("NODE_ENV"));
});

export default app;
