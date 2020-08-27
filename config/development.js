module.exports = {
  html: {
    style: false,
  },
  express: {
    port: 3000,
    session: {
      domain: "localhost",
      secure: false,
    },
    trust_proxy: false,
  },
  bunyan: {
    level: "debug",
  },
  graphql: {
    pretty: true,
    graphiql: true,
  },
  "bunyan-express": {
    excludes: [
      "body",
      "http-version",
      "req-headers",
      "res-headers",
      "response-hrtime",
      "user-agent",
    ],
    format: () => {
      return "";
    },
  },
};
