const serializers = {
    req: (req) => ({
        method: req.method,
        url: req.url,
    }),
    res: (res) => ({
        statusCode: res.statusCode,
    }),
};

module.exports = {
    express: {
        port: 3000,
        trust_proxy: false,
    },
    bunyan: {
        level: 'debug',
        name: 'nidarholm-dev',
        serializers,
    },
    'bunyan-express': {
        excludes: [
            'body',
            'http-version',
            'req-headers',
            'res-headers',
            'response-hrtime',
            'user-agent',
        ],
        format: () => '',
    },
    session: {
        secret: 'sessionsecret',
        cookiesecret: 'cookiesecret',
        name: 'ros.sid',
        saveUninitialized: false,
        rolling: false,
        resave: false,
        ttl: 86400000,
    },
    redis: {
        host: 'localhost',
        port: 6379,
        pass: undefined,
    },
    mongodb: {
        servers: ['mongodb://localhost/nidarholm-dev'],
        replset: null,
    },
    uri: 'http://localhost:3000/',
    sessionSecret: 'wS89da1kCq1ml6yYYPapxX6jReh9Kho1nnBxsI8QGo536iOiTo3xts3tppCUdZLl',
    auth: {
        facebook: {
            clientId: '291636897704096',
            clientSecret: '39b8e7aa941fa3c74caba6e3d1ecc3d4',
            callbackURL: 'http://localhost:3000/auth/facebook/callback',
        },
        google: {
            clientId: '504721013884-86lf0uioi6o4diok2e6l6mjap3evjf52.apps.googleusercontent.com',
            clientSecret: 'o7oG428qOXvCsNPtBfDo4Owz',
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        twitter: {
            clientId: 'Zo1Rbx6sp1j9YTSoqmAapc5yV',
            clientSecret: 'EzcmNycN1E50JFZKcRF8SyYW1s1bSgs6eztTqv8VQukO2ZxxUc',
            callbackURL: 'http://localhost:3000/auth/twitter/callback',
        },
    },
    files: {
        raw_prefix: '/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files',
        normal_prefix: '/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/normal',
        large_prefix: '/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/large',
        thumbnail_prefix: '/home/sigurdga/Prosjekter/nidarholmjs/uploaded_files/thumbnail',
    },
    organization: 'nidarholm',
    profile_picture_tag: 'profilbilde',
    news_tag: 'nyheter',
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
