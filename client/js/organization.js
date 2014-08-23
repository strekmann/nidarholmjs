module.exports.memberlistView = function () {
};

module.exports.editOrganizationView = function () {
    $("#postcode").keyup(function (event) {
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
};

var Admins = Ractive.extend({
    data: {
        users: [],
        musicscore_admins: []
    },
    addMusicscoreAdmin: function (user_id) {
        return $.ajax({
            url: '/organization/admin/musicscoreadmins',
            dataType: 'json',
            type: 'post',
            data: {
                user: user_id
            }
        });
    },
    removeMusicscoreAdmin: function (user) {
        return $.ajax({
            url: '/organization/admin/musicscoreadmins',
            datatype: 'json',
            type: 'delete',
            data: _.pick(user, '_id')
        });
    }
});

module.exports.addMusicscoreAdminView = function (o, u) {
    var admins = new Admins({
        el: '#musicscore-admins',
        template: '#musicscore-admins-template',
        data: {
            users: u,
            musicscore_admins: o.musicscore_admins
        }
    });

    admins.on('addMusicscoreAdmin', function (event) {
        event.original.preventDefault();

        admins.addMusicscoreAdmin(event.context.newadmin)
        .then(function (data) {
            admins.get('musicscore_admins').push(data);
        });
    });

    admins.on('removeMusicscoreAdmin', function (event) {
        event.original.preventDefault();

        var keypath = event.keypath;

        admins.removeMusicscoreAdmin(event.context)
        .then(function (data) {
            var index = event.keypath.split('.').pop();
            admins.get('musicscore_admins').splice(index, 1);
        });
    });
};
