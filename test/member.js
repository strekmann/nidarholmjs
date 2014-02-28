/*jshint expr: true*/

describe("Member", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        File = require('../server/models/files').File,
        organization_routes = require('../server/routes/organization');

    var user1,
        group;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.post('/test/members/groups/add', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.add_group(req, res, next);
            });
            app.get('/test/members/groups', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.memberlist(req, res);
            });
            app.get('/test/members/new', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.add_user(req, res);
            });
            app.post('/test/members/new', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.create_user(req, res, next);
            });
            app.get('/test/members/users', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.users(req, res);
            });
            app.get('/test/members/user/:username', function (req, res, next) {
                req.user = res.locals.user = user1;
                return organization_routes.user(req, res);
            });

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
            organization = new Organization({
                _id: 'nidarholm',
                member_group: group.id,
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

    describe("Add new instrument group to organization", function () {
        it("should add new instrument group to organization", function (done) {
            request(app)
            .post('/test/members/groups/add')
            .send({name: 'New group'})
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                //console.log(res.body);
                done();
            });
        });
        it("should find new instrument group in members combined list", function (done) {
            request(app)
                .get('/test/members/groups')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    //console.log(res.text);
                    var groups = $('#memberlist .group');
                    groups.last().find('h2').text().should.equal('New group');
                    done();
            });
        });
    });

    describe("Add members using another user", function () {
        var testuser_name = 'Random Testuser';
        it("should create user with organization membership, not instrument group membership", function (done) {
            request(app)
            .post('/test/members/new')
            .send({name: testuser_name})
            .expect(302)
            .end(function (err, res) {
                if (err) { return done(err); }
                done();
            });
        });
        it("should find the newly added member", function (done) {
            request(app)
            .get('/test/members/users')
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
        var groupid;
        it("should find group id for instrument group in form", function (done) {
            request(app)
            .get('/test/members/new')
            .set('Accept', 'text/html')
            .expect(200)
            .end(function (err, res) {
                $ = cheerio.load(res.text);
                var groups = $('#group option');
                groups.length.should.equal(3); // None, testgroup, New group
                groups.eq(2).text().should.equal('New group');
                groupid = groups.eq(2).attr('value');
                done(err);
            });

        });
        it("should create user with member permission and instrument group", function (done) {
            request(app)
            .post('/test/members/new')
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
            request(app)
            .get('/test/members/users')
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
            request(app)
            .get('/test/members/user/nidarholm.random-testuser.2')
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
            request(app)
            .get('/test/members/groups')
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
