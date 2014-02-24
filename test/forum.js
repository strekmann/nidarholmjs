/*jshint expr: true*/

describe("Forum", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        ForumPost = require('../server/models/forum').ForumPost,
        forum_routes = require('../server/routes/forum');

    var user1,
        post1,
        reply1,
        comment1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/forum/:id', function (req, res) {
                req.user = res.locals.user = user1;
                return forum_routes.get_post(req, res);
            });
            app.post('/test/forum/:postid/replies', function (req, res) {
                req.user = res.locals.user = user1;
                return forum_routes.create_reply(req, res);
            });
            app.post('/test/forum/:postid/replies/:replyid/comments', function (req, res) {
                req.user = res.locals.user = user1;
                return forum_routes.create_comment(req, res);
            });
            app.delete('/test/forum/:postid/replies/:replyid/comments/:commentid', function (req, res) {
                req.user = res.locals.user = user1;
                return forum_routes.delete_comment(req, res);
            });
            app.delete('/test/forum/:postid/replies/:replyid', function (req, res) {
                req.user = res.locals.user = user1;
                return forum_routes.delete_reply(req, res);
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
        it("should have 0 replies", function (done) {
            ForumPost.findById(post1.id, function (err, post) {
                post.replies.length.should.equal(0);
                done();
            });

            //request(app)
                //.get('/test/forum/' + post1.id)
                //.set('Accept', 'text/html')
                //.expect(200)
                //.end(function (err, res) {
                    //$ = cheerio.load(res.text);
                    //var script = $('script').last();
                    //console.log(script);
                    //console.log(res.text);
                //});
        });
        it("should add reply", function (done) {
            request(app)
                .post('/test/forum/' + post1.id + '/replies')
                .send({mdtext: 'A simple reply'})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should have 1 reply", function (done) {
            ForumPost.findById(post1.id, function (err, post) {
                post.replies.length.should.equal(1);
                post.replies[0].mdtext.should.equal('A simple reply');
                reply1 = post.replies[0];
                done();
            });
        });
    });

    describe("add comment", function () {
        it("should have 0 comments", function (done) {
            reply1.comments.length.should.equal(0);
            done();
        });
        it("should add comment", function (done) {
            request(app)
                .post('/test/forum/' + post1.id + '/replies/' + reply1.id + '/comments')
                .send({mdtext: 'A testcomment'})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should have 1 comment", function (done) {
            ForumPost.findById(post1.id, function (err, post) {
                post.replies.length.should.equal(1);
                post.replies.id(reply1.id).comments.length.should.equal(1);
                post.replies[0].comments[0].mdtext.should.equal('A testcomment');
                comment1 = post.replies[0].comments[0];
                done();
            });
        });
    });

    describe("remove comment", function () {
        it("should remove comment", function (done) {
            request(app)
                .del('/test/forum/' + post1.id + '/replies/' + reply1.id + '/comments/' + comment1.id)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should have 0 comments", function (done) {
            ForumPost.findById(post1.id, function (err, post) {
                post.replies.length.should.equal(1);
                post.replies.id(reply1.id).comments.length.should.equal(0);
                done();
            });
        });
    });

    describe("remove reply", function () {
        it("should remove reply", function (done) {
            request(app)
                .del('/test/forum/' + post1.id + '/replies/' + reply1.id)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should have 0 replies", function (done) {
            ForumPost.findById(post1.id, function (err, post) {
                post.replies.length.should.equal(0);
                done();
            });
        });
    });
});
