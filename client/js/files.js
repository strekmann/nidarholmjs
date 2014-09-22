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
                    tags.push(tag);
                    return prefix + tags.uniq.join("/");

                }
                else {
                    return prefix + tag;
                }
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
    }
});

module.exports.fileListView = function (f, active_user) {
    var files = new Files({
        el: '#files',
        template: '#template',
        data: {
            files: f,
            active_user: active_user,
        }
    });
    files.on('search', function (event) {
        event.original.preventDefault();

        var query = event.context.query;
        files.search(query)
        .then(function (data) {
            //console.log(data);
        });
    });

    files.on('deleteFile', function (event) {
        event.original.preventDefault();
        var file = $(event.node),
            promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function (file) {
            var index = event.keypath.split('.').pop();
            files.data.files.splice(index, 1);
        });
    });
    files.on('fetchMore', function (event) {
        event.original.preventDefault();
        files.add('page', 1);
        var promise = $.ajax({
            url: '/files',
            type: 'GET',
            dataType: 'json',
            data: {page: files.get('page')}
        });

        promise.then(function (data) {
            if (data.length === 0) {
                self.set('gotall', true);
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
    uploadzone.on("uploadprogress", function (file, progress) {
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

    $('#drop').on('click', function (event) {
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
        var tags = element.val;
        if (tags.length) {
            window.location.href = '/files/t/' + tags.join('/');
        }
        else {
            window.location.href = '/files';
        }
    });
};
