module.exports.editUserView = function () {
    $("#postcode").keyup(function (event) {
        var value = $(this).val();
        value = value.replace(/\D/g,'');
        if (value.length === 4) {
            var url = '/proxy/postcode/' + value;
            $.ajax({
                url: url,
                success: function (data) {
                    $('#city').val(data.city);
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
                return this.user === this.active_user;
            }
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
        var group = $(event.node),
            promise = $.ajax({
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
        var picture = $(event.node);
        picture.dropzone({
            url: event.node.href,
            init: function() {
                this.on("success", function(frontend_file, backend_file) {
                    ractive.data.user.files.push(backend_file);
                    $('#picture').attr('src', '/files/' + backend_file.path);
                });
            }
        });
        ractive.off("changeProfilePicture");
    });

    ractive.on("setProfilePicture", function (event) {
        event.original.preventDefault();
        var picture = $(event.node);
        var path = picture.children('img').attr('src'),
            promise = $.ajax({
                url: event.node.href,
                type: 'put',
                dataType: 'json'
            });
        promise.then(function (file) {
            $('#picture').attr('src', '/files/' + file.path);
        });
    });
};
