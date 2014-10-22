/*jshint expr: true*/

describe("Register user", function () {
    var cheerio = require('cheerio');

    var User = require('../server/models/index').User,
        index_routes = require('../server/routes/index');

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("Register user", function () {
        var agent = request.agent(app);
        var data = {
                name: "Test Testson",
                email: "testson@example.com",
                password1: "pass",
                password2: "pass"
            };

        it("should create user", function (done) {

            agent
                .post('/register')
                .send(data)
                .set('Accept', 'text/html')
                .expect(302)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.header.location.should.equal("/");
                    // check that user is actually saved
                    User.findOne({email: data.email}, function (err, user) {
                        if (err) {
                            done(err);
                        } else if (!user) {
                            done(new Error("User not found"));
                        } else {
                            done();
                        }
                    });
                });
        });
        it("should have logged in user", function (done) {
            agent
                .get('/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var username = $('#topbar-username').text();
                    username.should.equal(data.name);
                    done(err);
                });
        });
    });
    describe("Log in user", function () {
        var agent = request.agent(app);

        it("should not be logged in", function (done) {
            agent
                .get('/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var login = $('.login');
                    login.length.should.equal(1);
                    done(err);
                });
        });
        it("should log user in and follow redirect to see user is logged in", function (done) {
            agent
                .post('/login')
                .send({username: 'testson', password: 'pass'})
                .redirects(1)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var username = $('#topbar-username').text();
                    username.should.equal('testson');
                    done(err);
                });
        });
    });
});
