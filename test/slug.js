/*jshint expr: true*/

describe("Slug", function () {

    var util = require('../server/lib/util'),
        slug = util.slug,
        uslug = require('uslug'),
        cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Group = require('../server/models/index').Group,
        Organization = require('../server/models/index').Organization,
        Project = require('../server/models/projects').Project,
        project_routes = require('../server/routes/projects');

    var agent = request.agent(app),
        user1,
        group,
        organization,
        project1;

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

    describe("test normal slug", function () {
        it("should look nice for computers", function (done) {
            slug("Blåbærsyltetøy er godt").should.equal('blabaersyltetoy-er-godt');
            done();
        });
    });

    describe("test unicode slug", function () {
        it("should look nice for people", function (done) {
            uslug("Blåbærsyltetøy er godt").should.equal('blåbærsyltetøy-er-godt');
            done();
        });
    });

    describe("test creation using unicode, without specifying slug/tag", function () {
        it("should create new project", function (done) {
            var title = 'Blåbærsyltetøy er godt',
                private_mdtext = 'Some description',
                public_mdtext = 'Some public description',
                start = '2014-02-27',
                end = '2014-03-27';

            agent
                .post('/projects')
                .send({
                    title: title,
                    private_mdtext: private_mdtext,
                    public_mdtext: public_mdtext,
                    start: start,
                    end: end
                })
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.tag.should.equal('blåbærsyltetøy-er-godt');
                    done();
                });
        });
    });

});
