/*globals $, _, window, Ractive, moment, Dropzone*/

var Files = Ractive.extend({
    noIntro: true,
    data: {
        uploading_files: [],
        gotall: false,
        page: 0,
        filter: [],
        shortdate: function (date) {
            return moment(date).format("ll");
        },
        taglink: function (tag) {
            var prefix = "/files/t/";
            if (tag) {
                var old_tags = window.location.href.split(prefix, 2);
                if (old_tags.length === 2) {
                    // we have tags
                    var tags = old_tags[1].split("/");
                    if (!_.contains(tags, tag)) {
                        tags.push(tag);
                    }
                    return prefix + tags.join("/");

                }
                return prefix + tag;
            }
        }
    },
    search: function (query) {
        return $.ajax({
            url: '/tags',
            dataType: 'json',
            type: 'get',
            data: {
                q: query
            }
        });
    },
    updateFile: function (file) {
        return $.ajax({
            url: '/files/' + file._id,
            dataType: 'json',
            type: 'put',
            data: _.pick(file, 'filename', 'tags')
        });
    }
});

module.exports.fileDetailView = function (f) {
    var files = new Files({
        el: '#file',
        template: '#template',
        data: {
            file: f
        }
    });

    files.on('toggleEdit', function (event) {
        event.original.preventDefault();
        files.toggle('file.toggledEdit');
        require('s7n').tagify({selector: '#tags'});
    });

    files.on('updateFile', function (event) {
        event.original.preventDefault();
        event.context.file.tags = $(event.node).find('#tags')[0].value;

        files.updateFile(event.context.file)
        .then(function (data) {
            var file = files.get('file');
            file.tags = data.tags;
            file.filename = data.filename;
            file.toggledEdit = false;
            files.set('file', file);
        });
    });
};

module.exports.fileListView = function (f, _tags, active_user, admin_group) {
    var files = new Files({
        el: '#files',
        template: '#template',
        data: {
            files: f,
            tags: _tags,
            active_user: active_user,
            is_admin: function () {
                var is_member_of_group = _.find(active_user.groups, function (group) {
                    return group._id === admin_group._id;
                });
                return Boolean(is_member_of_group);
            }
        }
    });
    files.on('search', function (event) {
        event.original.preventDefault();

        var query = event.context.query;
        files.search(query)
        .then();
    });

    files.on('toggleEdit', function (event) {
        event.original.preventDefault();
        files.toggle('files.' + event.keypath.split('.').pop() + '.toggledEdit');
        require('s7n').tagify({selector: 'input.tags'});
    });

    files.on('editFile', function (event) {
        event.original.preventDefault();
        var index = event.keypath.split('.').pop();
        event.context.tags = $(event.node).find('input.tags')[0].value;

        files.updateFile(event.context)
        .then(function (data) {
            var file = files.get('files.' + index);
            file.tags = data.tags;
            file.filename = data.filename;
            file.toggledEdit = false;
            files.set('files.' + index, file);
        });
    });

    files.on('deleteFile', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function () {
            var index = event.keypath.split('.').pop();
            files.data.files.splice(index, 1);
        });
    });
    files.on('fetchMore', function (event) {
        event.original.preventDefault();
        files.add('page', 1);
        var promise = $.ajax({
            url: window.location.href,
            type: 'GET',
            dataType: 'json',
            data: {page: files.get('page')}
        });

        promise.then(function (data) {
            if (data.length === 0) {
                files.set('gotall', true);
            }
            files.data.files.push.apply(files.data.files, data);
        });
    });
    var uploadzone = new Dropzone("#upload", {
      //acceptedFiles: 'image/*',
      previewTemplate: '<span></span>'
    });

    uploadzone.on("sending", function (file) {
        files.data.uploading_files.push(file);
    });
    uploadzone.on("uploadprogress", function (file) { //, progress
        _.each(files.data.uploading_files, function (f, i) {
            if (f.name === file.name) {
                files.set('uploading_files.' + i, file);
            }
        });
    });
    uploadzone.on("success", function (frontend_file, backend_file) {
        _.each(files.data.uploading_files, function (f, i) {
            if (f.name === frontend_file.name) {
                files.data.uploading_files.splice(i, 1);
            }
        });
        files.data.files.unshift(backend_file);
    });

    $('#drop').on('click', function () {
        $('#upload').trigger('click');
    });

    require('s7n').tagify();
    var has_tags = window.location.href.split("/files/t/", 2);
    var tags;
    if (has_tags.length === 2) {
        tags = has_tags[1].split("/");
    }
    else {
        tags = [];
    }
    $('#filter').val(tags.join(","));

    require('s7n').tagify({selector: '#filter'}, function (element) {
        var t = element.val;
        if (t.length) {
            window.location.href = '/files/t/' + t.join('/');
        }
        else {
            window.location.href = '/files';
        }
    });
};
