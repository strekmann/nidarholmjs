/*jshint expr: true*/

describe("Forum", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        ForumPost = require('../server/models/forum').ForumPost,
        forum_routes = require('../server/routes/forum');

    var agent = request.agent(app),
        user1,
        post1,
        post2,
        reply1,
        comment1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

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

            post1 = new ForumPost({
                _id: 'post1',
                creator: user1,
                title: 'Testpost',
                mdtext: 'Some text'
            });

            user1.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    post1.save(function (err) {
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
        });
    });

    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("add post", function () {
        it("should have 1 post", function (done) {
            agent
                .get('/forum')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var posts = $('#forum .post');
                    posts.length.should.equal(1);
                    done();
                });
        });
        it("should add new post", function (done) {
            agent
                .post('/forum')
                .send({
                    title: 'New post',
                    mdtext: 'New content'
                })
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.creator.name.should.equal(user1.name);
                    post2 = res.body;
                    done();
                });
        });
        it("should have 2 posts", function (done) {
            agent
                .get('/forum')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var posts = $('#forum .post');
                    posts.length.should.equal(2);
                    done();
                });
        });
    });

    describe("delete post", function () {
        it("should delete one post", function (done) {
            agent
                .del('/forum/' + post2._id)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body._id.should.equal(post2._id);
                    done();
                });
        });
        it("should have 1 post left", function (done) {
            agent
                .get('/forum')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var posts = $('#forum .post');
                    posts.length.should.equal(1);
                    done();
                });
        });
    });

    describe("have two posts", function () {
        it("should create two posts", function (done) {
            agent
                .post('/forum')
                .send({
                    title: 'Post 1',
                    mdtext: 'Content 1'
                })
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) { return done(err); }
                    agent
                        .post('/forum')
                        .send({
                            title: 'Post 2',
                            mdtext: 'Content 2'
                        })
                        .set('Accept', 'application/json')
                        .end(function (err, res) {
                            if (err) { return done(err); }
                            done();
                        });
                });
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
            agent
                .post('/forum/' + post1.id + '/replies')
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
            agent
                .post('/forum/' + post1.id + '/replies/' + reply1.id + '/comments')
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
            agent
                .del('/forum/' + post1.id + '/replies/' + reply1.id + '/comments/' + comment1.id)
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
            agent
                .del('/forum/' + post1.id + '/replies/' + reply1.id)
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
