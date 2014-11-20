/*jshint expr: true*/

describe("Files", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var agent = request.agent(app),
        group,
        user1,
        file1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            group = new Group({
                _id: 'testgroup',
                name: 'testgroup',
                organization: 'nidarholm',
                members: [{user: 'testid'}]
            });

            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false,
                algorithm: 'sha1',
                salt: 'FSvFjOd5A0hmU2DeFebbf7PHRfA6+MZ6cLhdXstDre1K7o+4PGE//UGsb1P4RT03IlfrjV+Kzl4+F+68bDmyPpUsII3f3xbqfB67r1/ROHCGZL2lLyCFCeQ7AaMexaPrOc9c3oFd5ikAyZy43hknvYligkcGlV1a2mAJCqmodMs=',
                password: 'db14b6f48c30e441ef9f2ef7f3e1b0185f8eb5e3'
            });

            organization = new Organization({
                _id: 'nidarholm',
                member_group: group._id,
                administration_group: group._id,
                instrument_groups: [group]
            });

            file1 = new File({
                _id: "file1",
                creator: user1,
                filename: 'Already uploaded',
                hash: 'c22'
            });

            group.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    user1.save(function (err) {
                        if(err) {
                            done(err);
                        } else {
                            organization.save(function (err) {
                                if(err) {
                                    done(err);
                                } else {
                                    file1.save(function (err) {
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

    describe("upload file", function () {
        it("should have 1 file already uploaded", function (done) {
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
        it("should add another file programmatically", function (done) {
            var f = new File();
            f._id = "another";
            f.filename = "testfile.bmp";
            f.hash = "b17";
            f.creator = user1;
            f.save(function (err) {
                if (err) {
                    return done(err);
                }
                agent
                    .get('/files')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var files = $('#files .file');
                        files.length.should.equal(2);
                        done(err);
                    });
            });
        });
        it("should upload file", function (done) {
            agent
                .post('/files/upload')
                .attach('file', 'test/forum.js')
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
        it("should have 3 files uploaded", function (done) {
            agent
                .get('/files')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var files = $('#files .file');
                    files.length.should.equal(3);
                    done(err);
                });
        });
    });
});
