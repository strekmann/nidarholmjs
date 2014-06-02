var Project = require('./ractive/project');

var setup_editor = function (element_id) {
    var editor = new Editor($(element_id));
    editor.render();
    return editor;
};

module.exports.projectListView = function (projects) {
    var internal_editor;

    var projectlist = new Project({
        el: '#projects',
        template: '#template',
        data: {
            slug: ''
        }
    });
    projectlist.set('projects', projects);

    projectlist.on('setSlug', function (event) {
        var node = $(event.node);
        projectlist.set('slug', uslug(node.val()));
    });

    projectlist.on('toggleNew', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (projectlist.get('expanded')) {
                internal_editor = setup_editor('#private_mdtext');
            }
        }, 1);
    });

    $('#projects').on('click', '.deleteproject', function (event) {
        event.preventDefault();
        var project = $(this).parents('.project');
        var id = project.attr('data-id');
        $.ajax({
            url: '/projects/' + id,
            type: 'delete',
            dataType: 'json',
            success: function (data) {
                flash.data.success.push(data);
                project.remove();
            }
        });
    });

    $('.chosen-permissions').chosen({width: '100%'});
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
                dataType: 'json',
                data: post
            });

        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i forum');
            project.data.project.posts.push(data);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    project.on('deletePost', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete',
            dataType: 'json'
        });
        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble fjernet');
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
                dataType: 'json',
                data: ev
            });

        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i kalenderen');
            project.data.project.events.push(data);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    project.on('deleteEvent', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete',
            dataType: 'json'
        });
        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble fjernet fra kalenderen');
            var index = event.keypath.split('.').pop();
            project.data.project.events.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    var uploadzone = new Dropzone("#upload", {
      //acceptedFiles: 'image/*',
      previewTemplate: '<span></span>',
      clickable: '#add_file'
    });

    uploadzone.on("success", function (frontend_file, backend_file) {
        if (backend_file.is_image) {
            project.get('project.images').push(backend_file);
        }
        else {
            project.get('project.non_images').push(backend_file);
        }
    });

    return project;
};

module.exports.upcomingView = function (events) {
    var event_list = new Ractive({
        el: '#events',
        template: '#template',
        data: {
            events: events,
            marked: function (mdtext) {
                return marked(mdtext);
            },
            ago: function (date) {
                return moment(date).fromNow();
            },
            daterange: function (start, end) {
                var startm, endm;
                if (end) {
                    startm = moment(start);
                    endm = moment(end);
                    if (startm.isSame(endm, 'day')) {
                        // same day
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
                    }
                    else {
                        // different days
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                    }
                } else {
                    startm = moment(start);
                    return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
                }
            }
        }
    });
};
