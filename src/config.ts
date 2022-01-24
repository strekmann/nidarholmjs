import { config as dotenvConfig } from "dotenv";

import { getenv } from "./util";

dotenvConfig();

const name = "nidarholm";

export default {
  env: getenv("NODE_ENV", "development"),
  app: {
    name,
    domain: getenv("NIDARHOLM_DOMAIN", "localhost:3000"),
    uri: getenv("NIDARHOLM_URI", "http://localhost:3000"),
    port: parseInt(getenv("NIDARHOLM_PORT", "3000"), 10),
  },

  mongo: {
    host: getenv("NIDARHOLM_MONGO_HOST", "localhost"),
    port: parseInt(getenv("NIDARHOLM_MONGO_PORT", "27017"), 10),
    user: getenv("NIDARHOLM_MONGO_USER", "nidarholm"),
    password: getenv("NIDARHOLM_MONGO_PASSWORD", "nidarholm"),
    database: getenv("NIDARHOLM_MONGO_DATABASE", "nidarholm"),
  },

  session: {
    secret: getenv("NIDARHOLM_SESSION_SECRET", "default_secret"),
    name: getenv("NIDARHOLM_SESSION_NAME", `${name}.sid`),
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
      secure: Boolean(process.env.NIDARHOLM_SESSION_SECURE) || false,
      maxage: 1000 * 60 * 60 * 24 * 14,
    },
  },

  auth: {
    facebook: {
      clientId: getenv("FACEBOOK_CLIENT_ID"),
      clientSecret: getenv("FACEBOOK_CLIENT_SECRET"),
      callbackURL: getenv("FACEBOOK_CALLBACK_URL"),
    },
    google: {
      clientId: getenv("GOOGLE_CLIENT_ID"),
      clientSecret: getenv("GOOGLE_CLIENT_SECRET"),
      callbackURL: getenv("GOOGLE_CALLBACK_URL"),
    },
    twitter: {
      clientId: getenv("TWITTER_CLIENT_ID"),
      clientSecret: getenv("TWITTER_CLIENT_SECRET"),
      callbackURL: getenv("TWITTER_CALLBACK_URL"),
    },
    remember_me: true,
    jwt: true,
    smtp: undefined,
    noreplyAddress: undefined,
  },

  override: {
    user: undefined,
  },

  html: {
    style: true,
  },
};
