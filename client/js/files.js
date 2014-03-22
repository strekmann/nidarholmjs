module.exports.fileListView = function (files, active_user, active_organization) {
    var ractive = new Ractive({
        el: '#files',
        template: '#template',
        data: {
            files: files,
            uploading_files: [],
            active_user: active_user,
            active_organization: active_organization,
            is_image: function (file) {
                if(file.mimetype.match(/^image\/(png|jpeg|gif)/)) {
                    return true;
                }
            },
            is_public: function (permissions) {
                return permissions.public;
            },
            is_for_members: function (permissions) {
                var self = this;
                return _.find(permissions.groups, function (g) {
                    return g === self.data.active_organization.member_group;
                });
            },
            is_unpublished: function (permissions) {
                var for_public = permissions.public,
                    for_any_groups = permissions.groups.length,
                    for_any_members = permissions.users.length;

                return !for_public && !for_any_groups && !for_any_members;
            },
            shortdate: function (date) {
                return moment(date).format("ll");
            }
        }
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
