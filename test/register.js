/*jshint expr: true*/

describe("Register user", function () {

    var User = require('../server/models/index').User,
        index_routes = require('../server/routes/index');

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.post('/test/register', function (req, res) {
                return index_routes.register(req, res);
            });
            done();
        });
    });

    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("Register user", function () {
        it("should create user", function (done) {
            request(app)
                .post('/test/register')
                .send({
                    name: "Test Testson",
                    desired_username: "testson",
                    password1: "pass",
                    password2: "pass"
                })
                .set('Accept', 'text/html')
                .expect(302)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.header.location.should.equal("/");
                    // check that user is actually saved
                    User.findById('testson', function (err, user) {
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
    });
});
