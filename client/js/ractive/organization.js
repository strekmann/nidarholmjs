var Group = Ractive.extend({

    init: function (options) {
        this.restAPI = options.restAPI || '/api/organization';
    },

    addGroup: function (group) {
        var self = this,
            url = this.restAPI,
            promise = $.ajax({
                url: url,
                type: 'post',
                data: group,
            });

        promise.then(function (data) {
            self.data.groups.push(data);
        }, function (xhr, status, err) {
            console.error(err);
        });
    },

    data: {
        groups: [],
    }
});

module.exports.Group = Group;
