var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    util = require('../server/lib/util'),
    config = require('../server/settings'),
    User = require('../server/models').User;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm"),
    root_path = '/home/sigurdga/originals/';

var get_permissions = function (groupid) {
    var promise = new mongoose.Promise();

    var permissions = {public: false, groups: [], users: []};
    if (!post.group_id) {
        permissions.public = true;
        promise.fulfill(permissions);
    } else {
        Group.findOne({old_id: post.group_id}, function (err, group) {
            if (err) { promise.error(err);}
            permissions.groups.push(group._id);
            promise.fulfill(permissions);
        });
    }
    return promise;
};

client.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * from vault_uploadedfile', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.each(result.rows, function (file, callback) {
            var original_path = path.join(root_path, file.file);
            var exists = fs.existsSync(original_path);
            var basename = path.basename(file.file);

            if (exists) {
                get_permissions().then(function (permissions) {
                    util.upload_file(original_path, filename, 'nidarholm.' + file.user_id,
                                     {
                                         tags: util.tagify(file.tags),
                                         permissions: permissions,
                                         do_delete: false,
                                         do_create_duplicates_in_database: false
                                     }, function (err, f) {
                                         if (err && err.message !== "File already exists") {
                                             callback(err);
                                         }
                                         callback();
                                     });
                });
            } else {
                callback(new Error("File not found at", original_path));
            }
        }, function (err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Done");
            }
            client.end();
            mongoose.connection.close();
            if (err) { return console.error(err); }
        });
    });
});
