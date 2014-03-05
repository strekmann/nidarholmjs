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

    addInstrumentGroup: function (group) {
        var self = this,
            url = '/organization',
            promise = $.ajax({
                url: url,
                type: 'POST',
                data: group
            });

        promise.then(function (data) {
            self.data.igroups.push(group);
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    removeInstrumentGroup: function (group) {
        var self = this,
            url = '/organization/' + group._id,
            promise = $.ajax({
                url: url,
                type: 'DELETE'
            });

        promise.then(function (data) {
            var index =  _.indexOf(_.pluck(self.data.igroups, '_id'), group._id);
            if (index !== -1){
                self.data.igroups.splice(index, 1);
            }
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    data: {
        groups: [],
        igroups: []
    }
});

module.exports.Group = Group;
