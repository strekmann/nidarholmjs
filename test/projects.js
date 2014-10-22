/*jshint expr: true*/

describe("Projects", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        moment = require('moment'),
        util = require('../server/lib/util'),
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

    describe("add project", function () {
        it("should have empty project list", function (done) {
            agent
                .get('/projects')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var projects = $('#projects .project');
                    projects.length.should.equal(0);
                    done();
                });
        });
        it("should create new project", function (done) {
            var title = 'Project 1',
                tag = 'project1',
                private_mdtext = 'Some description',
                public_mdtext = 'Some public description',
                start = '2014-02-27',
                end = '2014-03-27';

            agent
                .post('/projects')
                .send({
                    title: title,
                    _id: tag,
                    private_mdtext: private_mdtext,
                    public_mdtext: public_mdtext,
                    start: start,
                    end: end
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    // TODO: Check all possible fields
                    // TODO: Add another test checking the minimum
                    res.body.title.should.equal(title);
                    project1 = res.body;
                    done();
                });
        });
        it("should have the new project", function (done) {
            agent
                .get('/projects')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var projects = $('#projects .project');
                    // TODO: Check all possible fields
                    projects.length.should.equal(1);
                    done();
                });
        });
    });
    describe("delete project", function () {
        it("should delete project", function (done) {
            agent
                .del('/projects/' + project1._id)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.title.should.equal(project1.title);
                    done();
                });
        });
    });

    describe("create minimal project", function () {
        it("should create a minimal project intended for reuse by other tests", function (done) {
            var title = 'Project 1',
                tag = 'project1',
                end = '2014-03-27';

            agent
                .post('/projects')
                .send({
                    title: title,
                    _id: tag,
                    end: end
                })
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.title.should.equal(title);
                    project1 = res.body;
                    done();
                });
        });
    });

    describe("add event to minimal project", function () {
        var event;
        it("should load project page using short url", function (done) {
            var id = project1.tag;
            var year = moment(project1.end).year();
            agent
                .get('/' + year + '/' + id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var events = $('#project #events .event');
                    events.length.should.equal(0);
                    done();
                });
        });
        it("should add event", function (done) {
            var project_id = project1._id,
                title = "Øving",
                location = "Rosenborg skole",
                start = "2014-02-24 18:30",
                end = "2014-02-24 21:30";

            agent
                .post('/projects/' + project_id + '/events')
                .send({
                    title: title,
                    location: location,
                    start: start,
                    end: end
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.title.should.equal(title);
                    res.body.tags[0].should.equal(project1.tag);
                    event = res.body;
                    done();
                });
        });
        it("should find new event on project page", function (done) {
            var id = project1.tag;
            var year = moment(project1.end).year();
            agent
                .get('/' + year + '/' + id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var events = $('#project #events .event');
                    events.length.should.equal(1);
                    done();
                });
        });
        it("should delete new event", function (done) {
            var event_id = event._id;
            agent
                .del('/events/' + event_id)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });
        it("should see that event is deleted", function (done) {
            var id = project1.tag;
            var year = moment(project1.end).year();
            agent
                .get('/' + year + '/' + id)
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var events = $('#project #events .event');
                    events.length.should.equal(0);
                    done();
                });
        });
    });
});
