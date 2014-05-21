module.exports = {
    siteName: 'boilerplate',
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    mongo: {
        servers: ['mongodb://localhost/nidarholm'],
        replset: null
    },
    locales: ['en'],
    defaultLocale: 'en',
    files: {
        raw_prefix: 'uploaded_files',
        picture_prefix: 'uploaded_files/pictures',
        thumbnail_prefix: 'uploaded_files/thumbnails'
    },
    organization: 'nidarholm',
    profile_picture_tag: 'profilbilde'
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
