var Group = require('./ractive/organization').Group;

module.exports.groupListView = function () {
    var grouplist = new Group({
        el: '#groups',
        template: '#template',
        restAPI: '/groups'
    });

    return grouplist;
};
