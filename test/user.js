/*jshint expr: true*/

describe("User", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
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
                req.user = res.locals.active_user = user1;
                return organization_routes.user(req, res);
            });
            app.post('/test/user/:username/groups', function (req, res) {
                req.user = res.locals.active_user = user1;
                return organization_routes.user_add_group(req, res);
            });
            app.get('/test/user/groups/:id', function (req, res) {
                req.user = res.locals.active_user = user1;
                return organization_routes.group(req, res);
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
                groups: [],
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

    describe("Add existing user to group", function () {
        it("should have empty group", function (done) {
            request(app)
                .get('/test/user/groups/'+group.id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var members = $('#members .member');
                    members.length.should.equal(0);
                    done(err);
                });
        });
        it("should see user page with list of groups", function (done) {
            request(app)
                .get('/test/user/testuserfriend')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var groups = $('#groups .group');
                    groups.length.should.equal(0);
                    var possible_groups = $('#group option');
                    possible_groups.length.should.equal(1);
                    done(err);
                });
        });
        it("should add one group", function (done) {
            request(app)
                .post('/test/user/testuserfriend/groups')
                .send({groupid: group.id})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    var result = res.body;
                    result.name.should.equal('testgroup');
                    result.members[0].user.should.equal('friend1');
                    done();
                });
        });
        it("should see added group", function (done) {
            request(app)
                .get('/test/user/testuserfriend')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var groups = $('#groups .group');
                    groups.length.should.equal(1);
                    groups.first().text().should.equal("testgroup");
                    // TODO: should maybe remove the possibility to add the group again
                    var possible_groups = $('#group option');
                    possible_groups.length.should.equal(1);
                    groupid = possible_groups.first().attr('value');
                    done(err);
                });
        });
        it("should see added user in group member page", function (done) {
            request(app)
                .get('/test/user/groups/'+group.id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var members = $('#members .member');
                    members.length.should.equal(1);
                    members.first().find('a').text().should.equal(user2.name);
                    done(err);
                });
        });
    });
});
