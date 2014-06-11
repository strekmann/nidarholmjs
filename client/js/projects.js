var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || window.location.href;
    },

    data: {
        projects: [],
        events: [],
        posts: [],
        images: [],
        non_images: [],

        marked: function(text){
            if (text) {
                return marked(text);
            }
        },
        shorten: function(filename, length) {
            if (!length) {
                length = 15;
            }
            var x = filename.split("."),
                extension = x.pop(),
                basename = x.join(".");
            if(basename.length > length + 3) {
                return basename.slice(0, length) + "…" + extension;
            }
            else {
                return filename;
            }
        },
        shortdate: function(date){
            if (date) {
                return moment(date).format('ll');
            }
        },
        isodate: function(date){
            if (date) {
                return moment(date).format("YYYY-MM-DD");
            }
        },
        isodatetime: function(date){
            if (date) {
                return moment(date).format();
            }
        },
        daterange: function (start, end) {
            var startm, endm, startd, endd;
            if (start && end) {
                startm = moment(start);
                endm = moment(end);
                startd = moment(start).startOf('day');
                endd = moment(end).startOf('day');
                if (startm.isSame(endm, 'day')) {
                    // same day
                    if (moment.utc(startm).isSame(startd, 'second') && moment(endm).isSame(endd, 'second')) {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                    }
                    else {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
                    }
                }
                else {
                    // different days
                    if (startm.isSame(startd, 'second') && endm.isSame(endd, 'second')) {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
                    }
                    else {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                    }
                }
            }
            else if (start) {
                // only start
                startm = moment(start);
                startd = moment.utc(startm).startOf('day');
                if (moment.utc(startm).isSame(startd, 'second')) {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
                }
            }
            else if (end) {
                // only end
                endm = moment(end);
                endd = moment.utc(endm).startOf('day');
                if (moment.utc(endm).isSame(endd, 'second')) {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                }
            }
        }
    },

    createProject: function (project) {
        return $.ajax({
            type: 'POST',
            url: this.restAPI,
            data: project
        });
    },
    updateProject: function (project) {
        return $.ajax({
            type: 'PUT',
            url: this.restAPI,
            data: project
        });
    },
    createPost: function (post, url) {
        return $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: post
        });
    },
    createEvent: function (event, url) {
        return $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: event
        });
    },
    setup_uploadzone: function (element_id, clickable_element_id) {
        var project = this;

        var uploadzone = new Dropzone(element_id, {
          //acceptedFiles: 'image/*',
          previewTemplate: '<span></span>',
          clickable: clickable_element_id
        });

        uploadzone.on("success", function (frontend_file, backend_file) {
            if (backend_file.is_image) {
                project.get('images').push(backend_file);
            }
            else {
                project.get('non_images').push(backend_file);
            }
        });
        return uploadzone;
    }
});

var setup_editor = function (element_id) {
    var editor = new Editor($(element_id));
    editor.render();
    return editor;
};

module.exports.projectListView = function (projects) {
    var internal_editor, uploadzone;

    var flash = require('s7n').flash;
    var projectlist = new Project({
        el: '#projects',
        template: '#template',
    });
    projectlist.set('projects', projects);

    projectlist.on('setSlug', function (event) {
        var node = $(event.node);
        projectlist.set('project.slug', uslug(node.val()));
    });

    projectlist.on('toggleNew', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (projectlist.get('expanded')) {
                projectlist.set('project.permissions', ['p']);
                internal_editor = setup_editor('#private_mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
                $('#permissions').chosen().change(function (event, data, more) {
                    console.log(event, data, more);
                });
            }
        }, 1);
    });

    projectlist.on('createProject', function (event) {
        event.original.preventDefault();
        internal_editor.codemirror.save();
        event.context.project.private_mdtext = $('#private_mdtext').val();
        event.context.project.permissions = $('#permissions').val();

        projectlist.createProject(event.context.project)
        .then(function (data) {
            projectlist.toggle('expanded');
            projectlist.get('projects').unshift(data);
            projectlist.set('project', {});
            flash.data.success.push(data.title + " er opprettet");
        }, function (xhr, status, err) {
            flash.get('error').push(err);
        });
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
};

module.exports.projectDetailView = function (project_obj, events, posts, files) {

    var images = [],
        non_images = [];

    _.each(files, function (file) {
        if (file.is_image) {
            images.push(file);
        }
        else {
            non_images.push(file);
        }
    });

    var project = new Project({
            el: '#project',
            template: '#template',
            restAPI: '/projects/' + project_obj._id,
            data: {
                project: project_obj,
                events: events,
                posts: posts,
                images: images,
                non_images: non_images
            }
        }),
        internal_editor;

    project.on('toggleEdit', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (project.get('expanded')) {
                internal_editor = setup_editor('#private_mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
            }
            else {
                project.setup_uploadzone('#upload', '#add_file');
            }
        }, 1);
    });

    project.on('updateProject', function (event) {
        event.original.preventDefault();
        internal_editor.codemirror.save(); //toTextArea();
        event.context.project.private_mdtext = $('#private_mdtext').val();
        project.updateProject(event.context.project)
        .then(function(data) {
            // ok
            project.set('project', data);
            project.fire('toggleEdit');
        }, function (xhr, status, err) {
            // error
        });
    });

    project.on('togglePost', function (event) {
        this.toggle('postExpanded');
    });

    project.on('createPost', function (event) {
        event.original.preventDefault();

        project.createPost(event.context.post, event.node.action)
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i forum');
            project.get('posts').unshift(data);
            project.fire('togglePost');
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    /*
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
    */

    project.on('toggleEvent', function (event) {
        this.toggle('eventExpanded');
    });

    project.on('createEvent', function (event) {
        event.original.preventDefault();

        project.createEvent(event.context.event, event.node.action)
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i kalenderen');
            project.get('events').unshift(data);
            project.fire('toggleEvent');
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    /*
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
    */

    project.setup_uploadzone('#upload', '#add_file');

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
