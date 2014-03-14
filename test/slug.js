/*jshint expr: true*/

describe("Slug", function () {

    var util = require('../server/lib/util'),
        slug = util.slug,
        uslug = require('uslug'),
        cheerio = require('cheerio'),
        mongoose = require('mongoose'),
        User = require('../server/models/index').User,
        Project = require('../server/models/projects').Project,
        project_routes = require('../server/routes/projects');

    var agent = request.agent(app),
        user1,
        project1;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {
            user1 = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Test Testson',
                is_active: true,
                is_admin: false,
                algorithm: 'md5',
                salt: 'oAJl6jsEVadxZ+5DwSlYjoMv7boVjqvyhU5ugd6KFlEFTSZfWpedJkQN6m5ovOq4FXLroFEzVpYugWwuIgEjTnpKQXPhC1feEI79tSlqUaJg8g2EWeazY5X0bby9csezVbJV62ohQ26a69QMgptzRmj8nfIC2R2Du+8gjs4q+Kw=',
                password: '13b42ad6d1c87bd25db9ad8cc0bf6c30'
            });
            user1.save(function (err) {
                agent
                    .post('/login')
                    .send({username: user1.username, password: 'pass'})
                    .expect(302)
                    .end(function(err, res) {
                        res.header.location.should.equal('/');
                        done(err);
                    });
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
});
