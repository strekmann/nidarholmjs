var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/forum';
        this.set('project', options.project);
    },

    data: {
        project: {},

        marked: function(text){
            return marked(text);
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
        shortdate: function(date){
            if (date) {
                return moment(date).format('ll');
            }
        },
        isodate: function(date){
            if (date) {
                return moment(date).format();
            }
        }
    }
});

module.exports = Project;
