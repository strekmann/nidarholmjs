/*jshint expr: true*/

describe("Group", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        organization_routes = require('../server/routes/organization');

    var agent = request.agent(app),
        user1,
        groups;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

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
            organization = new Organization({
                _id: 'nidarholm',
                member_group: group._id,
                administration_group: group._id,
                instrument_groups: [group]
            });
            group.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    user1.save(function (err) {
                        if(err) {
                            done(err);
                        } else {
                            organization.save(function (err) {
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
                }
            });
        });
    });
    after(function (done) {
        app.db.connection.db.dropDatabase(function () {
            done();
        });
    });

    describe("Add new instrument group to organization", function () {
        var groupid;
        it("should add new group to organization", function (done) {
            agent
            .post('/groups')
            .send({name: 'New group'})
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                groupid = res.body._id;
                done();
            });
        });
        it("should add new group as instrument group", function (done) {
            agent
            .post('/organization')
            .send({_id: groupid})
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                done();
            });
        });
        it("should find not find new group, as it has no members", function (done) {
            agent
                .get('/members')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var groups = $('#memberlist .group');
                    groups.length.should.equal(1);
                    done();
            });
        });
        it("should add member to new group", function (done) {
            agent
                .post('/users/testuser/groups')
                .send({groupid: groupid})
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.name.should.equal('New group');
                    done();
            });
        });
        it("should find new group in member list", function (done) {
            agent
                .get('/members')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var groups = $('#memberlist .group');
                    groups.last().find('h2').text().should.equal('New group');
                    done();
            });
        });
        /* Now ractive
        it("should find group id for instrument group in new user form", function (done) {
            agent
            .get('/members/new')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var groups = $('#group option');
                groups.length.should.equal(3); // None, testgroup, New group
                groups.eq(2).text().should.equal('New group');
                done(err);
            });
        });
        */
    });
});
