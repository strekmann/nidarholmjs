#!/usr/bin/env node

/* eslint no-param-reassign: "off" */
/* eslint camelcase: "off" */

import path from "path";
import http from "http";
import fs from "fs";

import bodyParser from "body-parser";
import connectMongo from "connect-mongo";
import cookieParser from "cookie-parser";
import errorHandler from "errorhandler";
import express, { NextFunction, Request, Response } from "express";
import graphqlHTTP from "express-graphql";
import session from "express-session";
import { getFarceResult } from "found/server";
import httpProxy from "http-proxy";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";
import multer from "multer";
import { ExtractJwt } from "passport-jwt";
import "regenerator-runtime/runtime";
import serveStatic from "serve-static";

import config from "../config";
import { ServerFetcher } from "../fetcher";
import {
  createResolver,
  historyMiddlewares,
  render,
  routeConfig,
} from "../router";

import sendPasswordToEmail from "./database/sendPasswordToEmail";
import { sendReminderEmails } from "./emailTasks";
import { icalEvents } from "./icalRoutes";
import "./lib/db";
import findFilePath from "./lib/findFilePath";
import passport from "./lib/passport";
import persistentLogin from "./lib/persistentLoginMiddleware";
import saveFile from "./lib/saveFile";
import { downloadMembers } from "./memberRoutes";
import File from "./models/File";
import Organization from "./models/Organization";
import PasswordCode from "./models/PasswordCode";
import User, { IUser } from "./models/User";
import { downloadArchive } from "./musicRoutes";
import renderPage from "./renderPage";
import schema from "./schema";

// import * as profileAPI from './server/api/profile';

moment.locale("nb");

const app = express();
const httpServer = http.createServer(app);
const { port } = config.app;

const upload = multer({ storage: multer.diskStorage({}) }).single("file");

app.set("trust proxy", 1);

app.use(cookieParser(config.session.secret));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (config.env === "test") {
  app.use(errorHandler());
  app.use(
    session({
      secret: "testing-secret",
      resave: config.session.resave,
      saveUninitialized: config.session.saveUninitialized,
    }),
  );
} else {
  const MongoStore = connectMongo(session);
  const maxAge: number = config.session.cookie.maxage;
  app.use(
    session({
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: maxAge / 1000,
        touchAfter: maxAge / 10000,
      }),
      secret: config.session.secret,
      name: config.session.name,
      resave: config.session.resave,
      saveUninitialized: config.session.saveUninitialized,
      rolling: config.session.rolling,
      cookie: {
        maxAge: config.session.cookie.maxage,
        secure: config.session.cookie.secure,
      },
    }),
  );
}

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const { auth } = config;
if (auth.remember_me) {
  app.use(passport.authenticate("remember-me"));
}
if (auth.jwt) {
  // Alternative authentication through authenticate bearer header and jwt.
  // Still allows anonymous requests, it just does not set req.user.
  app.use((req, res, next) => {
    if (res.locals.user) {
      return next();
    }
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return next();
    }
    return jwt.verify(
      token,
      config.session.secret,
      {},
      (error, decoded: any) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          return next();
        }
        if (!decoded.sub) {
          // no sub in token
          return next();
        }
        // @ts-ignore
        return passport.deserializeUser(decoded.sub.id, (err, user: IUser) => {
          if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
          } else if (user) {
            res.locals.user = user;
          }
          return next();
        });
      },
    );
  });
}

/* Static stuff */
app.use(serveStatic(path.join(__dirname, "..", "static")));

// We have a possibility to override user login during development
app.use((_req, res, next) => {
  if (config.env !== "production" && config.override.user) {
    User.findOne({ email: config.override.user })
      .exec()
      .then((user) => {
        if (user) {
          // eslint-disable-next-line no-console
          console.warn(`Running as ${user.name}`);
          res.locals.user = user;
        }
        next();
      });
  } else {
    next();
  }
});

// Fetch active organization from hostname, config override
// or pick the default.
app.use((_req, res, next) => {
  // TODO: Change this part for samklang.
  const organizationId = "nidarholm";

  Organization.findById(organizationId)
    .populate("member_group")
    .populate("administration_group")
    .populate("musicscoreadmin_group")
    .exec((err, organization) => {
      if (err) {
        return next(err);
      }
      res.locals.organization = organization?.toObject();
      if (res.locals.user) {
        res.locals.user.isMember = res.locals.user.groups.includes(
          res.locals.organization.member_group.id,
        );
        res.locals.user.isAdmin = res.locals.user.groups.includes(
          res.locals.organization.administration_group.id,
        );
        res.locals.user.isMusicAdmin = res.locals.user.groups.includes(
          res.locals.organization.musicscoreadmin_group.id,
        );
        res.locals.organization.user = res.locals.user.toObject();
      }
      return next();
    });
});

/* GraphQL */
app.use(
  "/graphql",
  graphqlHTTP((req: any, res: any) => {
    const contextValue = {
      viewer: res.locals.user,
      organization: res.locals.organization,
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
  return saveFile(req.file.path)
    .then((_file) => {
      return res.json(_file);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
});

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
      File.findOne({ hash: filepath }).then((file) => {
        res.sendFile(fullpath, {
          headers: { "Content-Type": file?.mimetype },
        });
      });
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/events/public.ics", icalEvents);
app.get("/events/export.ics", icalEvents);

app.get(
  "/music/archive.xlsx",
  (req, res, next) => {
    if (!res.locals.user.isMusicAdmin) {
      // eslint-disable-next-line no-console
      console.error("Not music admin");
      const error = new Error("Not music admin");
      next(error);
    }
    next();
  },
  downloadArchive,
);
app.get(
  "/members/list.xlsx",
  (req, res, next) => {
    if (!res.locals.user.isAdmin) {
      // eslint-disable-next-line no-console
      console.error("Not admin");
      const error = new Error("Not admin");
      next(error);
    }
    next();
  },
  downloadMembers,
);

/* Socket.io routes */
// socketRoutes(io);

if (
  process.env.NODE_ENV !== "production" &&
  process.env.NODE_ENV !== "docker"
) {
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
  req.session?.destroy((err: Error) => {
    // eslint-disable-next-line no-console
    console.error(`Cannot destroy session: ${err}`);
  });
  res.clearCookie("remember_me");
  res.redirect("/");
});

app.post(
  "/login",
  passport.authenticate("local"),
  persistentLogin,
  (_req, res, _next) => {
    res.redirect("/");
  },
);

app.get("/login/reset/:code", (req, res, next) => {
  return PasswordCode.findById(req.params.code)
    .exec()
    .then((passwordCode) => {
      if (
        !passwordCode ||
        moment(passwordCode.created) < moment().subtract(1, "hours")
      ) {
        return res.redirect("/login/reset");
      }
      return User.findById(passwordCode.user)
        .exec()
        .then((user) => {
          if (!user) {
            throw new Error("Could not log in user: Not found");
          }
          req.logIn(user, (err) => {
            if (err) {
              throw err;
            }
            return res.redirect(`/users/${user.id}/reset/${req.params.code}`);
          });
        });
    });
});

app.post("/login/register", async (req, res, next) => {
  const email = req.body.email.trim();
  const name = req.body.name.trim();
  const { organization } = res.locals;
  const alreadyExistingUser = await sendPasswordToEmail(email, organization);
  if (alreadyExistingUser) {
    return res.send(
      "Vi fant e-postadressa di i systemet fra før. Du får snart en e-post med mulighet til å sette nytt passord.",
    );
  }
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
    const url = req.session?.returnTo || "/";
    delete req.session?.returnTo;
    res.redirect(url);
  },
);

app.get("/login/facebook", passport.authenticate("facebook"));

app.get(
  "/login/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const url = req.session?.returnTo || "/";
    delete req.session?.returnTo;
    res.redirect(url);
  },
);

app.get("/login/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  persistentLogin,
  (req, res) => {
    const url = req.session?.returnTo || "/";
    delete req.session?.returnTo;
    res.redirect(url);
  },
);

// Send remaining requests to React frontend route matcher
app.use(async (req, res, next) => {
  const token = jwt.sign(
    {
      sub: res.locals.user,
      aud: config.app.domain,
      iss: config.app.domain,
    },
    config.session.secret,
  );
  const fetcher = new ServerFetcher(`http://localhost:${port}/graphql`, token);
  try {
    const result = await getFarceResult({
      url: req.url,
      historyMiddlewares,
      routeConfig,
      resolver: createResolver(fetcher),
      render,
    });

    if ("redirect" in result) {
      res.redirect(302, result.redirect.url);
      return;
    }

    res.status(result.status).send(renderPage(result.element, fetcher));
  } catch (error) {
    next(error);
  }
});

app.use(
  (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    let status = 500;
    let message = err.message || err;

    switch (err.name) {
      case "UnauthorizedError":
        status = 401;
        message = "Invalid token";
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(err, "unhandeled error");
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
  },
);

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
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

setInterval(() => {
  // eslint-disable-next-line no-console
  console.info("Email reminder running", moment().format());
  sendReminderEmails();
}, 60 * 60 * 1000);

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.info("port %s, env=%s", port, config.env);
});

export default app;

class HttpException extends Error {
  status: number;
  message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
