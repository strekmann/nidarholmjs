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

module.exports.projectView = function (project_obj, posts, events, files) {

    project_obj.posts = posts;
    project_obj.events = events;
    project_obj.files = files;

    var project = new Project({
        el: '#project',
        template: '#template',
        project: project_obj,
        restAPI: '/project/' + project_obj._id
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

    return project;
};
