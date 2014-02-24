/*jshint expr: true*/

describe("Forum", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        ForumPost = require('../server/models/forum').ForumPost,
        ForumReply = require('../server/models/forum').ForumReply,
        forum_routes = require('../server/routes/forum');

    var user1,
        post1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/forum/:postid', function (req, res) {
                req.user = res.locals.user = user1;
                return organization_routes.user(req, res);
            });

            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false
            });

            post1 = new ForumPost({
                creator: user1,
                title: 'Testpost',
                mdtext: 'Some text'
            });

            user1.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    post1.save(function (err) {
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

    describe("add reply", function () {
        it("should have 0 replies");
        it("should add reply");
        it("should have 1 reply");
    });

    describe("add comment", function () {
        it("should have 0 comments");
        it("should add comment");
        it("should have 1 comment");
    });

    describe("remove comment", function () {
        it("should remove comment");
        it("should have 0 comments");
    });

    describe("remove reply", function () {
        it("should remove reply");
        it("should have 0 replies");
    });
});
