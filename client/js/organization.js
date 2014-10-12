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
        groups: [],
        musicscoreadmin_group: null
    },
    setAdminGroup: function () {
        var self = this;
        return $.ajax({
            url: '/organization/admin/admin_group',
            dataType: 'json',
            type: 'put',
            data: {
                group: self.data.admin_group
            }
        });
    },
    setMusicscoreadminGroup: function () {
        var self = this;
        return $.ajax({
            url: '/organization/admin/musicscoreadmin_group',
            dataType: 'json',
            type: 'put',
            data: {
                group: self.data.musicscoreadmin_group
            }
        });
    }
});

module.exports.setMusicscoreAdminView = function (gs, ag, mg) {
    var admins = new Admins({
        el: '#admin-change',
        template: '#admin-change-template',
        data: {
            groups: gs,
            admin_group: ag,
            musicscoreadmin_group: mg
        }
    });

    admins.on('setAdminGroup', function (event) {
        event.original.preventDefault();
        admins.setAdminGroup()
        .then(function (data) {
        });
    });

    admins.on('setMusicscoreadminGroup', function (event) {
        event.original.preventDefault();
        admins.setMusicscoreadminGroup()
        .then(function (data) {
        });
    });
};
