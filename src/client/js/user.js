/*global $, _, Ractive, moment, flash, marked, Dropzone*/

module.exports.editUserView = function () {
    $("#postcode").keyup(function () {
        var value = $(this).val();
        value = value.replace(/\D/g,'');
        if (value.length === 4) {
            var url = '/proxy/postcode/' + value;
            $.ajax({
                url: url,
                success: function (data) {
                    $('#city').val(data);
                }
            });
        }
    });
    $("#country").chosen();
};

module.exports.userView = function (user, active_user) {
    var ractive = new Ractive({
        el: '#user',
        template: '#usertemplate',
        data: {
            user: user,
            active_user: active_user,
            is_active_user: function () {
                return this.get('user') === this.get('active_user');
            },
            is_active_image: function(image_id) {
                return this.get('user.profile_picture') === image_id;
            },
            ago: function (datetime) {
                return moment(datetime).from();
            },
            bday: function (datetime) {
                return moment(datetime).format('Do MMMM');
            },
            length: function (string) {
                return string.length;
            },
            marked: function (text) {
                if (text) {
                    return marked(text);
                }
            },
            phoneformat: function (number) {
                var original = number;
                number = number.replace(/^\+47/).trim();
                if (number.length === 8) {
                    // let's say it's a norwegian number
                    if (number.match(/^(?:4|9)/)) {
                        // mobile xxx xx xxx
                        return number.substr(0, 3) + " " + number.substr(3, 2) + " " + number.substr(5, 3);
                    }
                    return number.substr(0, 2) + " " + number.substr(2, 2) + " " + number.substr(4 ,2) + " " + number.substr(6, 2);
                }
                return original;
            },
            uploading_files: []
        }
    });

    ractive.on("addGroup", function (event) {
        event.original.preventDefault();
        var form = $(event.node),
            promise = $.ajax({
            url: event.node.action,
            type: 'POST',
            dataType: 'json',
            data: {
                groupid: form.find('#group').val()
            }
        });

        promise.then(function (group) {
            ractive.data.user.groups.push(group);
        }, function(xhr, status, err){
            flash.data.error.push('Er allerede medlem i ' + form.find('#group :selected').text());
        });
    });

    ractive.on("removeGroup", function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function (group) {
            var index = event.keypath.split('.').pop();
            ractive.data.user.groups.splice(index, 1);
        });
    });

    ractive.on("changeProfilePicture", function (event) {
        event.original.preventDefault();
        var pictures = $('#profile-pictures');
        $(document).foundation('reflow');
        pictures.foundation('reveal', 'open');
        var promise = $.ajax({
                url: '/users/' + ractive.get('user').username + '/pictures',
                type: 'GET',
                dataType: 'json'
            });
        promise.then(function (files) {
            ractive.set('user.files', files);
            Dropzone.autoDiscover = false;
            var uploadzone = new Dropzone("#upload", {
                acceptedFiles: 'image/*',
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
                ractive.data.user.files.unshift(backend_file);
                ractive.set('user.profile_picture', backend_file._id);
                ractive.set('user.profile_picture_path', backend_file.path);
                //uploadzone.removeFile(frontend_file); // unclutter empty spans from ignored template
            });
            //uploadzone.on("addedfile", function(file) { alert("Added file."); });
        });
    });

    ractive.on("setProfilePicture", function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
                url: event.node.href,
                type: 'put',
                dataType: 'json'
            });
        promise.then(function (file) {
            ractive.set('user.profile_picture', file._id);
            ractive.set('user.profile_picture_path', file.path);
            $('#profile-pictures').foundation('reveal', 'close');
        });
    });
};
module.exports.addUser = function () {
    var userform = new Ractive({
        el: '#adduser',
        template: '#template',
        data: {
            results: [],
            approx_date: function (datetime) {
                if (datetime) {
                    return moment(datetime).format('MMMM YYYY');
                }
            },
            phoneformat: function (number) {
                if (number) {
                    var original = number;
                    number = number.replace(/^\+47/).trim();
                    if (number.length === 8) {
                        // let's say it's a norwegian number
                        if (number.match(/^(?:4|9)/)) {
                            // mobile xxx xx xxx
                            return number.substr(0, 3) + " " + number.substr(3, 2) + " " + number.substr(5, 3);
                        }
                        return number.substr(0, 2) + " " + number.substr(2, 2) + " " + number.substr(4 ,2) + " " + number.substr(6, 2);
                    }
                    return original;
                }
            }
        }
    });

    userform.on('toggleExpanded', function () {
        userform.toggle('expanded');
    });

    userform.on('search', function (event) {
        var name = event.context.name;
        if (name.length > 1) {
            var promise = $.ajax({
                url: '/search/users',
                type: 'GET',
                dataType: 'json',
                data: {
                    q: name
                }
            });
            promise.then(function(data) {
                userform.set('results', data.users);
            });
        }
    });
};
