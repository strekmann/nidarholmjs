/*globals $, _, Ractive, flash*/

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

        /*jslint unparam: true*/
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

        /*jslint unparam: true*/
        promise.then(function () {
            self.data.igroups.push(group);
        }, function(xhr, status, err){
            flash.data.error.push(group.name + ' er allerede en instrumentgruppe');
        });
    },

    removeInstrumentGroup: function (group) {
        var self = this,
            url = '/organization/' + group._id,
            promise = $.ajax({
                url: url,
                type: 'DELETE'
            });

        /*jslint unparam: true*/
        promise.then(function () {
            var index =  _.indexOf(_.pluck(self.data.igroups, '_id'), group._id);
            if (index !== -1){
                self.data.igroups.splice(index, 1);
            }
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    orderInstrumentGroups: function () {
        var url = '/organization/order',
            promise = $.ajax({
                url: url,
                type: 'POST',
                data: {
                    group_order: _.pluck(this.data.igroups, '_id')
                }
            });

        /*jslint unparam: true*/
        promise.error(function(xhr, status, err){
            console.error(err);
        });
    },

    data: {
        groups: [],
        igroups: []
    }
});

module.exports.Group = Group;
