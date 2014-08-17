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
var client = new pg.Client(config.convert.pg),
    root_path = config.convert.path_avatars;
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * from avatar_avatar', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.eachLimit(result.rows, 100, function (avatar, callback) {
        var p = path.join(root_path, avatar.avatar);
        var exists = fs.existsSync(p);
        var basename = path.basename(avatar.avatar);
        if (exists && basename.replace(/\W/g, '')) {
            util.upload_file(
                p, basename,
                'nidarholm.' + avatar.user_id,
                {
                    tags: [config.profile_picture_tag],
                    do_delete: false,
                    do_create_duplicates_in_database: false,
                }, function (err, file) {
                    if (err && err.message !== "File already exists") {
                        callback(err);
                    }
                    if (!file) {
                        console.log("no file", p, basename);
                    }
                    if (avatar.primary) {
                        User.findById('nidarholm.' + avatar.user_id, function (err, user) {
                            if (err) { callback(err); }
                            user.profile_picture = file._id;
                            user.profile_picture_path = file.thumbnail_path;
                            user.save(function (err) {
                                callback(err);
                            });
                        });
                    } else {
                        callback();
                    }
                });
        } else {
            callback(new Error("No image"));
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
