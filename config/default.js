const project_name = "nidarholm";

const serializers = {
  req: (req) => ({
    method: req.method,
    url: req.url,
  }),
  res: (res) => ({
    statusCode: res.statusCode,
  }),
};

const mongodb_connection_string = process.env.MONGODB_CONNECTION
  ? process.env.MONGODB_CONNECTION
  : "mongodb://localhost/nidarholm-dev";

module.exports = {
  auth: {
    facebook: {
      clientId: "291636897704096",
      clientSecret: "39b8e7aa941fa3c74caba6e3d1ecc3d4",
      callbackURL: "http://localhost:3001/login/facebook/callback",
    },
    google: {
      clientId:
        "504721013884-86lf0uioi6o4diok2e6l6mjap3evjf52.apps.googleusercontent.com",
      clientSecret: "o7oG428qOXvCsNPtBfDo4Owz",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    twitter: {
      clientId: "Zo1Rbx6sp1j9YTSoqmAapc5yV",
      clientSecret: "EzcmNycN1E50JFZKcRF8SyYW1s1bSgs6eztTqv8VQukO2ZxxUc",
      callbackURL: "http://localhost:3001/auth/twitter/callback",
    },
    remember_me: true,
    jwt: true,
  },
  bunyan: {
    level: "info",
    name: "nidarholm",
    serializers,
  },
  "bunyan-express": {
    excludes: ["body", "http-version", "req-headers", "res-headers"],
    format:
      ":remote-address :incoming :method :url HTTP/:http-version :status-code :res-headers[content-length] :referer :user-agent[family] :user-agent[major].:user-agent[minor] :user-agent[os] :response-time ms",
  },
  express: {
    port: 3000,
    trust_proxy: true,
    session: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      name: "nidarholm.sid",
      path: "/",
      resave: false,
      rolling: true,
      saveUninitialized: false,
      secret: "sessionsecret",
      httpOnly: true,
      secure: true, // false in development
    },
  },
  files: {
    raw_prefix: "/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files",
    normal_prefix:
      "/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/normal",
    large_prefix: "/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/large",
    thumbnail_prefix:
      "/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/thumbnail",
  },
  graphql: {
    graphiql: false,
    pretty: false,
  },
  html: {
    style: true,
  },
  mongodb: {
    servers: [mongodb_connection_string],
    replset: null,
  },
  news_tag: "nyheter",
  organization: "nidarholm",
  profile_picture_tag: "profilbilde",
  site: {
    protocol: "https",
    domain: "nidarholm.no",
  },
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
