describe("User", function () {

    var cheerio = require('cheerio');
    var mongoose = require('mongoose');
    var config = require('config');
    var _ = require('underscore');
            //util = require('../src/server/lib/util'),
    var User = require('../src/server/models/User').default;
    var Group = require('../src/server/models/Group').default;
    var Organization = require('../src/server/models/Organization').default;
    var File = require('../src/server/models/File').default;
    var request = require('supertest');
    var app = require('../src/server/index').default;

    var agent = request.agent(app),
        user1,
        user2,
        group,
        org;

    before(function (done) {
        mongoose.connection.db.dropDatabase(function() {
                done();
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
            group.save().then(() => {
                user1.save().then(() => {
                    user2.save().then(() => {
                        org.save().then(() => {
                            console.log("ost");
                            agent
                            .post('/login')
                            .send({username: user1.username, password: 'Passw0rd'})
                            .expect(302)
                            .end(function(err, res) {
                                res.header.location.should.equal('/');
                                console.log("Logged in", err);
                                done(err);
                            });
                        })
                    })
                })
            })
            .catch((err) => {
                done(err);
            });
            /*
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
            */
        });
    });

    describe("Add existing user to group", function () {
        it("should have viewer (testuser) as member", function (done) {
            agent
                .get('/groups/' + group.id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    var $ = cheerio.load(res.text);
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
