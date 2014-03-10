/*jshint expr: true*/

describe("Select permission", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var agent = request.agent(app),
        user1,
        user2,
        group,
        file;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

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
                is_admin: false,
                algorithm: 'md5',
                salt: 'oAJl6jsEVadxZ+5DwSlYjoMv7boVjqvyhU5ugd6KFlEFTSZfWpedJkQN6m5ovOq4FXLroFEzVpYugWwuIgEjTnpKQXPhC1feEI79tSlqUaJg8g2EWeazY5X0bby9csezVbJV62ohQ26a69QMgptzRmj8nfIC2R2Du+8gjs4q+Kw=',
                password: '13b42ad6d1c87bd25db9ad8cc0bf6c30'
            });
            file = new File({
                filename: 'filename',
                path: 'secret/place/file',
                creator: 'user1',
                permissions: {
                    users: [],
                    groups: [],
                    public: true // must see file in list to check permission select
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
                                        agent
                                            .post('/login')
                                            .send({username: user1.username, password: 'pass'})
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

    describe("Check group membership in permission select", function () {

        it("should see one group in permission select", function (done) {
            agent
                .get('/files')
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
                agent
                    .get('/files')
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
