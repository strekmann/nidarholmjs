/*jshint expr: true*/

describe("User", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        ObjectId = mongoose.Types.ObjectId,
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        organization_routes = require('../server/routes/organization');

    var user1,
        user2,
        group;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/user/:username', function (req, res) {
                req.user = res.locals.user = user1;
                return organization_routes.user(req, res);
            });
            app.post('/test/user/:username/groups', function (req, res) {
                req.user = res.locals.user = user1;
                return organization_routes.user_add_group(req, res);
            });

            //mock
            group = new Group({
                name: 'testgroup',
                organization: 'nidarholm'
            });
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                is_active: true,
                is_admin: false
            });
            user2 = new User({
                _id: 'friend1',
                username: 'testuserfriend',
                name: 'Friend Friendson',
                groups: [group],
                is_active: true,
                is_admin: false
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
                                done(err);
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

    describe("Add user", function () {
        it("should be able to add a new user from another user");
    });

    describe("Add existing user to group", function () {
        var groupid;

        it("should see user page with list of groups", function (done) {
            request(app)
                .get('/test/user/testuserfriend')
                    .set('Accept', 'text/html')
                    .expect(200)
                    .end(function (err, res) {
                        $ = cheerio.load(res.text);
                        var groups = $('#groups .group');
                        groups.length.should.equal(1);
                        groups.first().text().should.equal("testgroup");
                        var possible_groups = $('#group option');
                        possible_groups.length.should.equal(1);
                        groupid = possible_groups.first().attr('value');
                        done(err);
                    });
        });
        it("should add one group", function (done) {
            request(app)
                .post('/test/user/testuserfriend/groups')
                .send({groupid: groupid})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should see added group");
    });
});
