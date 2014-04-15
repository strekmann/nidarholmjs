/*jshint expr: true*/

describe("Normalize", function () {

    var util = require('../server/lib/util'),
        normalize = util.normalize,
        tagify = util.tagify;

    describe("normalize words", function () {
        it("should normalize 'Blåbærsyltetøy er godt' to 'blåbærsyltetøyergodt'", function (done) {
            var w = util.normalize('Blåbærsyltetøy er godt');
            w.should.equal('blåbærsyltetøyergodt');
            done();
        });
    });

    describe("tagify tag list", function () {
        it("should normalize tag list", function (done) {
            var taglist = util.tagify('This, is many, tag$');
            taglist.length.should.equal(3);
            taglist[0].should.equal('this');
            taglist[1].should.equal('ismany');
            taglist[2].should.equal('tag');
            done();
        });
    });
});
