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

module.exports.projectView = function (project_obj) {

    var project = new Project({
        el: '#project',
        template: '#template',
        project: project_obj,
        restAPI: '/project/' + project_obj._id
    });

    project.on('createPost', function (event) {
        event.original.preventDefault();
        var node = $(event.node),
            post = {
                title: node.find('#post_title').val(),
                mdtext: node.find('#post_mdtext').val(),
            },
            promise = $.ajax({
                url: event.node.action,
                type: 'POST',
                data: post
            });

        promise.then(function (data) {
            $('#flash').append('<div data-alert class="alert-box success">' + data.title + ' ble lagt til i forum</div>');
            project.data.project.posts.push(data);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    project.on('deletePost', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete'
        });
        promise.then(function (data) {
            $('#flash').append('<div data-alert class="alert-box success">' + data.title + ' ble fjernet</div>');
            var index = event.keypath.split('.').pop();
            project.data.project.posts.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    project.on('createEvent', function (event) {
        event.original.preventDefault();
        var node = $(event.node),
            ev = {
                title: node.find('#event_title').val(),
                location: node.find('#event_location').val(),
                start: node.find('#event_start').val(),
                end: node.find('#event_end').val(),
                md_text: node.find('#event_mdtext').val()
            },
            promise = $.ajax({
                url: event.node.action,
                type: 'POST',
                data: ev
            });

        promise.then(function (data) {
            $('#flash').append('<div data-alert class="alert-box success">' + data.title + ' ble lagt til i kalenderen</div>');
            project.data.project.events.push(data);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    project.on('deleteEvent', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete'
        });
        promise.then(function (data) {
            $('#flash').append('<div data-alert class="alert-box success">' + data.title + ' ble fjernet</div>');
            var index = event.keypath.split('.').pop();
            project.data.project.events.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    return project;
};
