/*jshint expr: true*/

describe("Select permission", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var user1,
        user2,
        group,
        file;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/select-permissions/files', function (req, res) {
                req.user = res.locals.user = user1;
                return file_routes.all(req, res);
            });

            //mock
            group = new Group({
                name: 'testgroup',
                organization: 'nidarholm'
            });
            user2 = new User({
                _id: 'friend1',
                username: 'testuserfriend',
                name: 'Friend Friendson',
                groups: [group],
                is_active: true,
                is_admin: false
            });
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                friends: [user2],
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
                    broadcast: true // must see file in list to check permission select
                }
            });
            group.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    user1.save(function (err) {
                        if (err) {
                            done(err);
                        } else {
                            user2.save(function (err) {
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
                }
            });
        });
    });

    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("Check group membership in permission select", function () {

        it("should see one group in permission select", function (done) {
            request(app)
                .get('/test/select-permissions/files')
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
            user1.save(function (err) {
                if (err) { return done(err); }
                request(app)
                    .get('/test/select-permissions/files')
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
