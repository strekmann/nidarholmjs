var Project = require('./ractive/project');

module.exports.projectListView = function () {
    $('#projects').on('click', '.deleteproject', function (event) {
        event.preventDefault();
        var project = $(this).parents('.project');
        var id = project.attr('data-id');
        $.ajax({
            url: '/projects/' + id,
            type: 'delete',
            success: function (data) {
                $('#flash').append('<div data-alert class="alert-box success">' + data + '</div>');
                project.remove();
            }
        });
    });
};

module.exports.projectView = function (objectid) {

    var forum = new Project({
        el: '#forum',
        template: '#forumtemplate',
        restAPI: '/project/' + objectid
    });

    var eventlist = new Project({
        el: '#events',
        template: '#eventlisttemplate',
        restAPI: '/project/' + objectid
    });

    var filelist = new Project({
        el: '#files',
        template: '#filelisttemplate',
        restAPI: '/project/' + objectid
    });

    $('#events').on('click', '.deleteevent', function (event) {
        event.preventDefault();
        var url = $(this).attr('href');
        var projectevent = $(this).parents('.event');
        $.ajax({
            url: url,
            type: 'delete',
            success: function (data) {
                $('flash').append('<div data-alert class="alert-box success">' + data + '</div>');
                projectevent.remove();
            }
        });
    });

    return {
        forum: forum,
        events: eventlist,
        files: filelist
    };
};
