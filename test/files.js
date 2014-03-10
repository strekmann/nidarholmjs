/*jshint expr: true*/

describe("Files", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var agent = request.agent(app),
        user1,
        file1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false,
                algorithm: 'md5',
                salt: 'oAJl6jsEVadxZ+5DwSlYjoMv7boVjqvyhU5ugd6KFlEFTSZfWpedJkQN6m5ovOq4FXLroFEzVpYugWwuIgEjTnpKQXPhC1feEI79tSlqUaJg8g2EWeazY5X0bby9csezVbJV62ohQ26a69QMgptzRmj8nfIC2R2Du+8gjs4q+Kw=',
                password: '13b42ad6d1c87bd25db9ad8cc0bf6c30'

            });

            file1 = new File({
                creator: user1,
                filename: 'Already uploaded',
                path: '/somewhere/else'
            });

            user1.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    file1.save(function (err) {
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
            f.filename = "testfile.bmp";
            f.path = "/some/strange/place/on/the/server";
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
