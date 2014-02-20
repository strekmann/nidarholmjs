/*jshint expr: true*/

describe("Organization", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        ObjectId = mongoose.Types.ObjectId,
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var user,
        group,
        file;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/files', function (req, res) {
                req.user = res.locals.user = user;
                return file_routes.all(req, res);
            });

            //mock
            group = new Group({
                name: 'testgroup',
                organization: 'testorg'
            });
            user = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                is_active: true,
                is_admin: false
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
                                done(err);
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
            file.permissions.groups.push(new ObjectId(group._id.toString()));
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
    describe("Check group membership in permission select", function () {
        it("should see one testgroup in permission select", function (done) {
            request(app)
                .get('/test/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var files = $('#files .file');
                    files.length.should.equal(1);
                    var first = files.first();
                    var select = first.find('.chosen-permissions');

                    // Very specific about how it is built
                    var groups = select.children().eq(1).children();
                    groups.length.should.equal(1);
                    groups.first().attr('value').should.equal('g-'+group.id);
                    done(err);
                });
        });

        it("should have one friend in user list", function (done) {
            var user2 = new User({
                _id: 'friend1',
                username: 'testuserfriend',
                name: 'Friend Friendson',
                groups: [group],
                is_active: true,
                is_admin: false
            });
            user2.save(function (err) {
                if (err) { return done(err); }
                user.friends.push(user2);
                user.save(function (err) {
                    if (err) { return done(err); }
                    request(app)
                        .get('/test/files')
                        .set('Accept', 'text/html')
                        .expect(200)
                        .end(function (err, res) {
                            $ = cheerio.load(res.text);
                            var files = $('#files .file');
                            files.length.should.equal(1);
                            var first = files.first();
                            var select = first.find('.chosen-permissions');

                            // Very specific about how it is built
                            var people = select.children().eq(2).children();
                            people.length.should.equal(1);
                            people.first().attr('value').should.equal('u-'+user2.id);
                            done(err);
                        });

                });

            });
        });
    });
});
