module.exports = {
    siteName: 'boilerplate',
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
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
    defaultLocale: 'en',
    files: {
        raw_prefix: 'uploaded_files',
        normal_prefix: 'uploaded_files/normal',
        large_prefix: 'uploaded_files/large',
        thumbnail_prefix: 'uploaded_files/thumbnail'
    },
    organization: 'nidarholm',
    profile_picture_tag: 'profilbilde',
    news_tag: 'nyheter'
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
