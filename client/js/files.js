module.exports.fileListView = function (files, active_user, active_organization) {
    var ractive = new Ractive({
        el: '#files',
        template: '#template',
        data: {
            files: files,
            uploading_files: [],
            active_user: active_user,
            active_organization: active_organization,
            gotall: false,
            page: 0,
            path: function (file) {
                return '/files/' + file.hash + '/' + file.filename;
            },
            is_image: function (file) {
                if(file.mimetype.match(/^image\/(png|jpeg|gif)/)) {
                    return true;
                }
            },
            shortdate: function (date) {
                return moment(date).format("ll");
            }
        }
    });
    ractive.on('deleteFile', function (event) {
        event.original.preventDefault();
        var file = $(event.node),
            promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function (file) {
            var index = event.keypath.split('.').pop();
            ractive.data.files.splice(index, 1);
        });
    });
    ractive.on('fetchMore', function (event) {
        event.original.preventDefault();
        ractive.add('page', 1);
        var promise = $.ajax({
            url: '/files',
            type: 'GET',
            dataType: 'json',
            data: {page: ractive.get('page')}
        });

        promise.then(function (data) {
            if (data.length === 0) {
                self.set('gotall', true);
            }
            ractive.data.files.push.apply(ractive.data.files, data);
        });
    });
    var uploadzone = new Dropzone("#upload", {
      //acceptedFiles: 'image/*',
      previewTemplate: '<span></span>'
    });

    uploadzone.on("sending", function (file) {
        ractive.data.uploading_files.push(file);
    });
    uploadzone.on("uploadprogress", function (file, progress) {
        _.each(ractive.data.uploading_files, function (f, i) {
            if (f.name === file.name) {
                ractive.set('uploading_files.' + i, file);
            }
        });
    });
    uploadzone.on("success", function (frontend_file, backend_file) {
        _.each(ractive.data.uploading_files, function (f, i) {
            if (f.name === frontend_file.name) {
                ractive.data.uploading_files.splice(i, 1);
            }
        });
        ractive.data.files.unshift(backend_file);
    });
};
