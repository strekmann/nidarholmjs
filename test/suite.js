// import stuff
var mongoose = require('mongoose');
var config = require('config');

// Before all tests
before(function(done) {
    console.log("Before all tests.");
    if (!mongoose.connection.db) {
        mongoose.connect(config.get('mongodb.test'), function() {
            mongoose.connection.db.dropDatabase(function() {
                done();
            });
        });
    }
    else {
        done();
    }
});

// After all tests
after(function(done) {
    console.log("\nAll tests done.");
    done();
});
