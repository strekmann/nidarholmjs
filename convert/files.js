var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    util = require('../server/lib/util'),
    config = require('../server/settings'),
    Group = require('../server/models').Group,
    User = require('../server/models').User;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client(config.convert.pg),
    root_path = config.convert.path_files;

var get_permissions = function (groupid) {
    var promise = new mongoose.Promise();

    var permissions = {public: false, groups: [], users: []};
    if (!groupid) {
        permissions.public = true;
        promise.fulfill(permissions);
    } else {
        Group.findOne({old_id: groupid}, function (err, group) {
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

        async.eachLimit(result.rows, 256, function (file, callback) {
            var original_path = path.join(root_path, file.file);
            var exists = fs.existsSync(original_path);
            var basename = path.basename(file.file);

            if (exists) {
                get_permissions(file.group_id).then(function (permissions) {
                    util.upload_file(original_path, file.filename, 'nidarholm.' + file.user_id,
                                     {
                                         tags: util.tagify(file.tags),
                                         permissions: permissions,
                                         created: file.uploaded,
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
                console.error("File not found at " + original_path + ": " + file.filename);
                callback();
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
