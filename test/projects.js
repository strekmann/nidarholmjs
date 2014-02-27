/*jshint expr: true*/

describe("Projects", function () {

    var cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Project = require('../server/models/projects').Project,
        project_routes = require('../server/routes/projects');

    var user1,
        project1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            app.get('/test/projects/projects', function (req, res, next) {
                req.user = res.locals.user = user1;
                return project_routes.index(req, res, next);
            });
            app.post('/test/projects/projects', function (req, res, next) {
                req.user = res.locals.user = user1;
                return project_routes.create_project(req, res, next);
            });
            app.delete('/test/projects/projects/:id', function (req, res, next) {
                req.user = res.locals.user = user1;
                return project_routes.delete_project(req, res, next);
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
});
