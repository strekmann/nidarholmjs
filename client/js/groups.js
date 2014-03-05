var Group = require('./ractive/organization').Group;

module.exports.groupListView = function () {
    var grouplist = new Group({
        el: '#groups',
        template: '#template',
        restAPI: '/groups'
    });

    grouplist.on('addGroup', function (event) {
        event.original.preventDefault();

        var form = $(event.node),
            group = {
                name: form.find('#name').val()
            };

        grouplist.addGroup(group);
        form[0].reset();
    });

    grouplist.on('addInstrumentGroup', function (event) {
        var group = event.context;
        grouplist.addInstrumentGroup(group);
    });

    grouplist.on('removeInstrumentGroup', function (event) {
        var group = event.context;
        grouplist.removeInstrumentGroup(group);
    });

    return grouplist;
};
