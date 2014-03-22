var Group = require('./ractive/organization').Group;

module.exports.groupView = function (group, users) {
    var ractive = new Ractive({
        el: '#users',
        template: '#grouptemplate',
        data: {
            group: group,
            users: users
        }
    });
    ractive.on("addUser", function (event) {
        event.original.preventDefault();
        var form = $(event.node),
            promise = $.ajax({
            url: event.node.action,
            type: 'POST',
            dataType: 'json',
            data: {
                username: form.find('#user').val()
            }
        });

        promise.then(function (user) {
            ractive.data.group.members.push({user: user});
        }, function(xhr, status, err){
            flash.data.error.push(form.find('#user :selected').text() + ' er allerede med gruppa');
        });
    });

    ractive.on("removeUser", function (event) {
        event.original.preventDefault();
        var user = $(event.node),
            promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function () {
            var index = event.keypath.split('.').pop();
            ractive.data.group.members.splice(index, 1);
        });
    });
};

module.exports.groupListView = function () {
    var grouplist = new Group({
        el: '#groups',
        template: '#template',
        restAPI: '/groups'
    });

    grouplist.on('toggleNew', function (event) {
        this.toggle('expanded');
    });

    grouplist.on('addGroup', function (event) {
        event.original.preventDefault();

        var form = $(event.node),
            group = {
                name: form.find('#name').val()
            };

        this.toggle('expanded');
        grouplist.addGroup(group);
    });

    grouplist.on('addInstrumentGroup', function (event) {
        var group = event.context;
        grouplist.addInstrumentGroup(group);
    });

    grouplist.on('removeInstrumentGroup', function (event) {
        var group = event.context;
        grouplist.removeInstrumentGroup(group);
    });

    grouplist.on('moveInstrumentGroup', function (event) {
        grouplist.orderInstrumentGroups();
    });

    return grouplist;
};
