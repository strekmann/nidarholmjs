moment.lang($('html').attr('lang'));

var flash = function (messages, member_group) {

    var permissions_component = Ractive.extend({
        template: '#permissionstemplate',
        data: {
            // will not work everywhere if we set a default value
            // permissions: {public: false, groups: [], users: []},
            member_group: member_group,
            is_public: function (permissions) {
                return permissions.public;
            },
            is_for_members: function (permissions) {
                var self = this;
                return _.find(permissions.groups, function (g) {
                    return g === self.data.member_group;
                });
            },
            is_unpublished: function (permissions) {
                var for_public = permissions.public,
                for_any_groups = permissions.groups.length,
                for_any_members = permissions.users.length;

                return !for_public && !for_any_groups && !for_any_members;
            }
        }
    });

    var ractive = new Ractive({
        el: '#flash',
        template: '#flashtemplate',
        data: {
            error: messages.error || [],
            warning: messages.warning || [],
            success: messages.success || [],
            infos: messages.info || []
        }
    });

    ractive.on('closeMessage', function (event) {
        var key_num = event.keypath.split(".");
        this.data[key_num[0]].splice(key_num[1], 1);
    });

    Ractive.components.permissionicons = permissions_component;

    return ractive;
};


module.exports = {
    base: require('./base'),
    forum: require('./forum'),
    organization: require('./organization'),
    groups: require('./groups'),
    user: require('./user'),
    projects: require('./projects'),
    files: require('./files'),
    flash: flash
};
