/*jshint expr: true*/

describe("Member", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        organization_routes = require('../server/routes/organization');

    var agent = request.agent(app),
        user1,
        groupid,
        groups;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            group = new Group({
                _id: 'testgroup',
                name: 'testgroup',
                organization: 'nidarholm'
            });
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                groups: [group],
                is_active: true,
                is_admin: false,
                algorithm: 'sha1',
                salt: 'FSvFjOd5A0hmU2DeFebbf7PHRfA6+MZ6cLhdXstDre1K7o+4PGE//UGsb1P4RT03IlfrjV+Kzl4+F+68bDmyPpUsII3f3xbqfB67r1/ROHCGZL2lLyCFCeQ7AaMexaPrOc9c3oFd5ikAyZy43hknvYligkcGlV1a2mAJCqmodMs=',
                password: 'db14b6f48c30e441ef9f2ef7f3e1b0185f8eb5e3'
            });
            organization = new Organization({
                _id: 'nidarholm',
                member_group: group.id,
                instrument_groups: [group]
            });
            group.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    groupid = group._id;
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

    describe("Add members using another user", function () {
        var testuser_name = 'Random Testuser';
        it("should create user with organization membership, not instrument group membership", function (done) {
            agent
            .post('/members/new')
            .send({name: testuser_name})
            .expect(302)
            .end(function (err, res) {
                if (err) { return done(err); }
                done();
            });
        });
        it("should find the newly added member", function (done) {
            agent
            .get('/users')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var members = $('#users .user');
                members.length.should.equal(2);
                members.eq(1).find('a').text().should.equal(testuser_name);
                members.eq(1).find('a').attr('href').should.equal('/users/nidarholm.random-testuser.1');
                done(err);
            });
        });
        it("should create user with member permission and instrument group", function (done) {
            agent
            .post('/members/new')
            .send({name: testuser_name, orgperm: true, group: groupid})
            .expect(302)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
        it("should find the newly added member that has groups", function (done) {
            agent
            .get('/users')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var members = $('#users .user');
                members.length.should.equal(3);
                members.eq(2).find('a').text().should.equal(testuser_name);
                members.eq(2).find('a').attr('href').should.equal('/users/nidarholm.random-testuser.2');
                done(err);
            });
        });
        it("should find the groups of the newly added member", function (done) {
            agent
            .get('/users/nidarholm.random-testuser.2')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var groups = $('#groups .group');
                //console.log(groups.text());
                groups.length.should.equal(2);
                done(err);
            });
        });
        it("should find the new user in memberlist page", function (done) {
            agent
            .get('/members')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var users = $('#memberlist .group .member');
                //console.log(groups.text());
                users.length.should.equal(2);
                users.last().find('a').text().should.equal(testuser_name);
                done(err);
            });
        });
    });
});
