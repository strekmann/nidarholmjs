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
};
