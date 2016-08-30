module.exports = {
    siteName: 'boilerplate',
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        facebook: {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            callbackURL: 'http://localhost:3000/auth/facebook/callback'
        },
        twitter: {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            callbackURL: 'http://localhost:3000/auth/twitter/callback'
        },
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        /*},
        smtp: {
            host: 'mail.brogar.org',
            port: '587',
            auth: {
                user: 'username@nidarholm.no',
                pass: 'passord'
            },
            noreply_address: 'Nidarholm <noreply@nidarholm.no'
        },
        mailsync: {
            password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        */
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
    default_locale: 'en',
    files: {
        raw_prefix: '/tmp/uploaded_files',
        normal_prefix: '/tmp/uploaded_files/normal',
        large_prefix: '/tmp/uploaded_files/large',
        thumbnail_prefix: '/tmp/uploaded_files/thumbnail'
    },
    organization: 'nidarholm',
    profile_picture_tag: 'profilbilde',
    news_tag: 'nyheter'
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
