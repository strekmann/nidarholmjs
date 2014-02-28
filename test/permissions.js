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

    var user,
        group,
        file;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/files', function (req, res) {
                req.user = res.locals.active_user = user;
                return file_routes.all(req, res);
            });

            //mock
            group = new Group({
                name: 'testgroup',
                organization: 'nidarholm'
            });
            user = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                is_active: true,
                is_admin: false
            });
            organization = new Organization({
                _id: 'nidarholm',
                instrument_groups: [group]
            });
            file = new File({
                filename: 'filename',
                path: 'secret/place/file',
                creator: 'user1',
                permissions: {
                    users: [],
                    groups: [],
                    broadcast: false
                }
            });
            user.save(function (err) {
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
                                        done(err);
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
            request(app)
                .get('/test/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var username = $('#topbar-username').text();
                    username.should.equal(user.username);
                    done();
                });
        });
    });

    describe("Check file permissions", function () {
        it("should not see any files, none for this user", function (done) {
            request(app)
                .get('/test/files')
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
            file.permissions.broadcast = true;
            file.save(function (err) {
                if (err) { return done(err); }
                request(app)
                    .get('/test/files')
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
                request(app)
                    .get('/test/files')
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
                request(app)
                    .get('/test/files')
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
                request(app)
                    .get('/test/files')
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
