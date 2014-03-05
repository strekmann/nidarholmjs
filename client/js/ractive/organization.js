var Group = Ractive.extend({

    init: function (options) {
        this.restAPI = options.restAPI || '/api/organization';
    },

    data: {
        groups: [],
    }
});

module.exports.Group = Group;
