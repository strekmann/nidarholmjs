import { config as dotenvConfig } from "dotenv";
import SMTPConnection from "nodemailer/lib/smtp-connection";

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
    url: getenv("MONGO_URL", "mongodb://localhost/nidarholm"),
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
      clientId: getenv("FACEBOOK_CLIENT_ID", ""),
      clientSecret: getenv("FACEBOOK_CLIENT_SECRET", ""),
      callbackURL: getenv("FACEBOOK_CALLBACK_URL", ""),
    },
    google: {
      clientId: getenv("GOOGLE_CLIENT_ID", ""),
      clientSecret: getenv("GOOGLE_CLIENT_SECRET", ""),
      callbackURL: getenv("GOOGLE_CALLBACK_URL", ""),
    },
    twitter: {
      clientId: getenv("TWITTER_CLIENT_ID", ""),
      clientSecret: getenv("TWITTER_CLIENT_SECRET", ""),
      callbackURL: getenv("TWITTER_CALLBACK_URL", ""),
    },
    remember_me: true,
    jwt: true,
    smtp: getSmtpConfig(),
    noreplyAddress: getenv(
      "DEFAULT_FROM_EMAIL",
      "Nidarholm <no-reply@nidarholm.no",
    ),
  },

  override: {
    user: undefined,
  },

  html: {
    style: true,
  },

  spaces: {
    baseUrl: "https://eethu.fra1.digitaloceanspaces.com",
    bucketName: "eethu",
    pathPrefix: "nidarholm/files",
    keyId: getenv("AWS_ACCESS_KEY_ID", ""),
    secretKey: getenv("AWS_SECRET_ACCESS_KEY", ""),
    endpoint: "fra1.digitaloceanspaces.com",
  },
};

function getSmtpConfig(): SMTPConnection.Options | undefined {
  const host = process.env.SMTP_HOST;
  const portString = process.env.SMTP_PORT;
  const user = process.env.SMTP_AUTH_USER;
  const password = process.env.SMTP_AUTH_PASSWORD;

  if (host && portString && user && password) {
    return {
      host,
      port: parseInt(portString, 10),
      auth: { user, pass: password },
    };
  }
}
