/*jshint expr: true*/

describe("Projects", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        util = require('../server/lib/util'),
        User = require('../server/models/index').User,
        Project = require('../server/models/projects').Project,
        project_routes = require('../server/routes/projects');

    var user1,
        project1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/projects/projects', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.index(req, res, next);
            });
            app.post('/test/projects/projects', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.create_project(req, res, next);
            });
            app.delete('/test/projects/projects/:id', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.delete_project(req, res, next);
            });
            app.get('/test/projects/projects/:id', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.project(req, res, next);
            });
            app.post('/test/projects/projects/:id/events', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.project_create_event(req, res, next);
            });
            app.delete('/test/projects/projects/:project_id/events/:event_id', function (req, res, next) {
                req.user = res.locals.active_user = user1;
                return project_routes.project_delete_event(req, res, next);
            });
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false
            });
            user1.save(function (err) {
                done(err);
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
            request(app)
                .get('/test/projects/projects')
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

            request(app)
                .post('/test/projects/projects')
                .send({
                    title: title,
                    tag: tag,
                    private_mdtext: private_mdtext,
                    public_mdtext: public_mdtext,
                    start: start,
                    end: end
                })
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
            request(app)
                .get('/test/projects/projects')
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
            request(app)
                .del('/test/projects/projects/' + project1._id)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.title.should.equal(project1.title);
                    done();
                });
        });
    });

    describe("create minimal project", function () {
        it("should create a minimal project inteded for reuse by other tests", function (done) {
            var title = 'Project 1',
                tag = 'project1',
                end = '2014-03-27';

            request(app)
                .post('/test/projects/projects')
                .send({
                    title: title,
                    tag: tag,
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
            var id = util.h2b64(project1._id);
            request(app)
                .get('/test/projects/projects/' + id)
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

            request(app)
                .post('/test/projects/projects/' + project_id + '/events')
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
            var id = util.h2b64(project1._id);
            request(app)
                .get('/test/projects/projects/' + id)
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
            var project_id = project1._id;
            var event_id = event._id;
            request(app)
                .del('/test/projects/projects/' + project_id + '/events/' + event_id)
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.title.should.equal(event.title);
                    done();
                });
        });
        it("should see that event is deleted", function (done) {
            var id = util.h2b64(project1._id);
            request(app)
                .get('/test/projects/projects/' + id)
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
