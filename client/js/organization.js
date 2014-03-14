module.exports.memberlistView = function () {
};

module.exports.userView = function (user) {
    var grouplist = new Ractive({
        el: '#groups',
        template: '#usertemplate',
        data: {
            user: user
        }
    });

    grouplist.on("addGroup", function (event) {
        event.original.preventDefault();
        var form = $(event.node),
            promise = $.ajax({
            url: event.node.action,
            type: 'POST',
            dataType: 'json',
            data: {
                groupid: form.find('#group').val()
            }
        });

        promise.then(function (group) {
          grouplist.data.user.groups.push(group);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    grouplist.on("removeGroup", function (event) {
        event.original.preventDefault();
        var group = $(event.node),
            promise = $.ajax({
                url: event.node.href,
                type: 'delete',
                dataType: 'json'
            });

        promise.then(function (group) {
            var index = event.keypath.split('.').pop();
            grouplist.data.user.groups.splice(index, 1);
        });
    });
};
