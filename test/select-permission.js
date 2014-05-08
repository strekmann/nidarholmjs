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
                _id: 'testgroup',
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
                algorithm: 'sha1',
                salt: 'FSvFjOd5A0hmU2DeFebbf7PHRfA6+MZ6cLhdXstDre1K7o+4PGE//UGsb1P4RT03IlfrjV+Kzl4+F+68bDmyPpUsII3f3xbqfB67r1/ROHCGZL2lLyCFCeQ7AaMexaPrOc9c3oFd5ikAyZy43hknvYligkcGlV1a2mAJCqmodMs=',
                password: 'db14b6f48c30e441ef9f2ef7f3e1b0185f8eb5e3'
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

    describe("Check group membership in permission select", function () {

        it("should see public option", function (done) {
            agent
                .get('/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var select = $('#permissions');
                    var p = select.children().eq(0).children().first();
                    p.attr('value').should.equal('p');
                    done(err);
                });
        });

        it("should see one group in permission select", function (done) {
            agent
                .get('/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var select = $('#permissions');
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
                        var select = $('#permissions');
                        var people = select.children().eq(2).children();
                        people.length.should.equal(1);
                        people.first().attr('value').should.equal('u-'+user2.id);
                        done(err);
                    });
            });
        });
    });
});
