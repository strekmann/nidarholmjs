moment.lang($('html').attr('lang'));

var flash = function (messages, member_group_id) {

    var permissions_component = Ractive.extend({
        template: '#permissionstemplate',
        data: {
            // will not work everywhere if we set a default value
            // permissions: {public: false, groups: [], users: []},
            member_group_id: member_group_id,
            is_public: function (permissions) {
                return permissions.public;
            },
            is_for_members: function (permissions) {
                var self = this;
                return _.find(permissions.groups, function (g) {
                    return g === self.data.member_group_id;
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

var tagify = function () {
    $('#tags').select2({
        width: '100%',
        tags: $('#tags').val().split(', '),
        tokenSeparators: [",", " "],
        minimumInputLength: 2,
        initSelection: function (element, callback) {
            var data = [];
            $(element.val().split(", ")).each(function () {
                data.push({id: this, text: this});
            });
            callback(data);
        },
        createSearchChoice: function(term, data) {
            if ($(data).filter(function() {
                return this.text.localeCompare(term) === 0;
            }).length === 0) {
                return {
                    id: term,
                    text: term
                };
            }
        },
        ajax: {
            url: "/tags",
            dataType: "json",
            quietMillis: 100,
            data: function (term, page) {
                return {
                    q: term
                };
            },
            results: function (data, page) {
                return {results: _.map(data.tags, function(tag) {
                    return {id: tag, text: tag};
                })};
            }
        }
    });
};

module.exports = {
    base: require('./base'),
    forum: require('./forum'),
    organization: require('./organization'),
    groups: require('./groups'),
    user: require('./user'),
    projects: require('./projects'),
    files: require('./files'),
    flash: flash,
    tagify: tagify
};

