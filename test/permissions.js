/*jshint expr: true*/

describe("Permissions", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        ObjectId = mongoose.Types.ObjectId,
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files'),
        organization_routes = require('../server/routes/organization');

    var agent = request.agent(app),
        user1,
        group,
        file;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            //mock
            group = new Group({
                name: 'testgroup',
                organization: 'nidarholm'
            });
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                is_active: true,
                is_admin: false,
                algorithm: 'sha1',
                salt: 'FSvFjOd5A0hmU2DeFebbf7PHRfA6+MZ6cLhdXstDre1K7o+4PGE//UGsb1P4RT03IlfrjV+Kzl4+F+68bDmyPpUsII3f3xbqfB67r1/ROHCGZL2lLyCFCeQ7AaMexaPrOc9c3oFd5ikAyZy43hknvYligkcGlV1a2mAJCqmodMs=',
                password: 'db14b6f48c30e441ef9f2ef7f3e1b0185f8eb5e3'
            });
            organization = new Organization({
                _id: 'nidarholm',
                instrument_groups: [group]
            });
            file = new File({
                filename: 'filename',
                hash: 'e33',
                creator: 'user1',
                permissions: {
                    users: [],
                    groups: [],
                    public: false
                }
            });
            user1.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    group.save(function (err) {
                        if (err) {
                            done(err);
                        } else {
                            file.save(function (err) {
                                if (err) {
                                    done(err);
                                } else {
                                    organization.save(function (err) {
                                        agent
                                            .post('/login')
                                            .send({username: user1.username, password: 'Passw0rd'})
                                            .expect(302)
                                            .end(function(err, res) {
                                                res.header.location.should.equal('/');
                                                done(err);
                                            });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("Check test setup", function () {
        it("should have logged in user", function (done) {
            agent
                .get('/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var username = $('#topbar-username').text();
                    username.should.equal(user1.username);
                    done();
                });
        });
    });

    describe("Check file permissions", function () {
        it("should not see any files, none for this user", function (done) {
            agent
                .get('/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var files = $('#files .file');
                    files.length.should.equal(0);
                    done(err);
                });
        });
        it("should see one public file", function (done) {
            file.permissions.public = true;
            file.save(function (err) {
                if (err) { return done(err); }
                agent
                    .get('/files')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var files = $('#files .file');
                        files.length.should.equal(1);
                        done(err);
                    });
            });
        });
        it("should see file created by self", function (done) {
            file.permissions.broadcast = false;
            file.creator = 'testid';
            file.save(function (err) {
                if (err) { return done(err); }
                agent
                    .get('/files')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var files = $('#files .file');
                        files.length.should.equal(1);
                        done(err);
                    });
            });
        });
        it("should see file published for self", function (done) {
            file.creator = 'user1';
            file.permissions.users.push('testid');
            file.save(function (err) {
                if (err) { return done(err); }
                agent
                    .get('/files')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var files = $('#files .file');
                        files.length.should.equal(1);
                        done(err);
                    });
            });
        });
        it("should see file published for a group", function (done) {
            file.permissions.users.pull('testid');
            file.permissions.groups.push(group._id);
            file.save(function (err) {
                if (err) { return done(err); }
                agent
                    .get('/files')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var files = $('#files .file');
                        files.length.should.equal(1);
                        done(err);
                    });
            });
        });
    });
});
