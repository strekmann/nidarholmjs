/*jshint expr: true*/

describe("User", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        _ = require('underscore'),
        util = require('../server/lib/util'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        organization_routes = require('../server/routes/organization');

    var agent = request.agent(app),
        user1,
        user2,
        group,
        org;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            //mock
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
                groups: [group._id],
                is_active: true,
                is_admin: false,
                algorithm: 'sha1',
                salt: 'FSvFjOd5A0hmU2DeFebbf7PHRfA6+MZ6cLhdXstDre1K7o+4PGE//UGsb1P4RT03IlfrjV+Kzl4+F+68bDmyPpUsII3f3xbqfB67r1/ROHCGZL2lLyCFCeQ7AaMexaPrOc9c3oFd5ikAyZy43hknvYligkcGlV1a2mAJCqmodMs=',
                password: 'db14b6f48c30e441ef9f2ef7f3e1b0185f8eb5e3'
            });
            user2 = new User({
                _id: 'friend1',
                username: 'testuserfriend',
                name: 'Friend Friendson',
                groups: [],
                is_active: true,
                is_admin: false
            });
            org = new Organization({
                _id: 'nidarholm',
                administration_group: 'testgroup',
                member_group: 'testgroup'
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
                                org.save(function (err) {
                                    if (err) {
                                        done(err);
                                    }
                                    agent
                                        .post('/login')
                                        .send({username: user1.username, password: 'Passw0rd'})
                                        .expect(302)
                                        .end(function(err, res) {
                                            res.header.location.should.equal('/');
                                            done(err);
                                        });
                                });
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
        it("should have viewer (testuser) as member", function (done) {
            agent
                .get('/groups/' + group.id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var members = $('#members .member');
                    members.length.should.equal(1); // testuser is member to be able to see page
                    done(err);
                });
        });
        it("should see user page with list of groups", function (done) {
            agent
                .get('/users/testuserfriend')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var groups = $('#groups .group');
                    groups.length.should.equal(0);
                    var possible_groups = $('#groups .option');
                    possible_groups.length.should.equal(1);
                    done(err);
                });
        });
        it("should add one group", function (done) {
            agent
                .post('/users/testuserfriend/groups')
                .send({groupid: group.id})
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    var result = res.body;
                    result.name.should.equal('testgroup');
                    var found = _.find(result.members, function (m) { return m.user === 'friend1'; });
                    expect(found);
                    done();
                });
        });
        it("should see added group", function (done) {
            agent
                .get('/users/testuserfriend')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var groups = $('#groups .group');
                    groups.length.should.equal(1);
                    groups.first().text().should.equal("testgroup");
                    // TODO: should maybe remove the possibility to add the group again
                    var possible_groups = $('#groups .option');
                    possible_groups.length.should.equal(1);
                    groupid = possible_groups.first().attr('value');
                    done(err);
                });
        });
        it("should see added user in group member page", function (done) {
            agent
                .get('/groups/' + group.id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var members = $('#members .member');
                    members.length.should.equal(2);
                    members.first().find('a').text().should.equal(user2.name);
                    done(err);
                });
        });
    });
});
