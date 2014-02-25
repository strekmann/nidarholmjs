/*jshint expr: true*/

describe("Files", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        File = require('../server/models/files').File,
        file_routes = require('../server/routes/files');

    var user1,
        file1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/files/files', function (req, res) {
                req.user = res.locals.user = user1;
                return file_routes.all(req, res);
            });
            app.post('/test/files/upload', function (req, res) {
                req.user = res.locals.user = user1;
                return file_routes.upload(req, res);
            });

            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false
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
                        done(err);
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
            request(app)
                .get('/test/files/files')
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
                request(app)
                .get('/test/files/files')
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
            request(app)
                .post('/test/files/upload')
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
            request(app)
                .get('/test/files/files')
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
