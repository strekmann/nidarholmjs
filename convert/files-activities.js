var mongoose = require('mongoose'),
    _ = require('underscore'),
    moment = require('moment'),
    async = require('async'),
    marked = require('marked'),
    File = require('../server/models/files').File,
    Activity = require('../server/models').Activity;

mongoose.connect('mongodb://localhost/nidarholm');

File.find({}, function (err, files) {
    async.each(files, function (file, callback) {

        var change = {user: file.creator, changed: file.created};
        var modified = file.created;

        //console.log(users);
        Activity.findOne({content_type: 'upload', 'changes.user': file.creator, modified: {$gt: moment(file.created).subtract('hours', 1).toDate()}}, function (err, activity) {

            if (!activity) {
                activity = new Activity();
                activity.content_type = 'upload';
            }
            activity.content_ids.push(file._id);
            activity.title = file.filename;
            activity.changes.push(change);
            activity.permissions = {
                users: file.permissions.users,
                groups: file.permissions.groups,
                public: file.permissions.public
            };
            activity.modified = modified;

            if (file.tags) {
                _.each(file.tags, function (tag) {
                    activity.tags.addToSet(tag);
                });
            }

            if (!activity.content) {
                activity.content = {};
            }

            if (file.is_image) {
                if (!activity.content.images) {
                    activity.content.images = [];
                }
                var image_already_there = _.find(activity.content.images, function (path) {
                    return path === file.thumbnail_path;
                });
                if (!image_already_there) {
                    activity.content.images.push(file.thumbnail_path);
                }
            }
            else {
                if (!activity.content.non_images) {
                    activity.content.non_images = [];
                }
                var already_there = _.find(activity.content.non_images, function (filename) {
                    return filename === file.filename;
                });
                if (!already_there) {
                    activity.content.non_images.push(file.filename);
                }
            }
            activity.markModified('content');
            activity.save(function (err) {
                //console.log(activity);
                callback(err);
            });
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }
        mongoose.connection.close();
    });
});
