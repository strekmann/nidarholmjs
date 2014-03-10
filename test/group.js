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
                algorithm: 'md5',
                salt: 'oAJl6jsEVadxZ+5DwSlYjoMv7boVjqvyhU5ugd6KFlEFTSZfWpedJkQN6m5ovOq4FXLroFEzVpYugWwuIgEjTnpKQXPhC1feEI79tSlqUaJg8g2EWeazY5X0bby9csezVbJV62ohQ26a69QMgptzRmj8nfIC2R2Du+8gjs4q+Kw=',
                password: '13b42ad6d1c87bd25db9ad8cc0bf6c30'
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
                                agent
                                    .post('/login')
                                    .send({username: user1.username, password: 'pass'})
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
    });
});
