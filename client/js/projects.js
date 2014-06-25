var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || window.location.href;
    },

    data: {
        active_user: null,
        projects: [],
        previous_projects: [],
        events: [],
        event: null,
        posts: [],
        images: [],
        non_images: [],
        year: moment().year(),

        snippify: function (text, wanted_length) {
            if (!wanted_length) {
                wanted_length = 500;
            }
            text = marked(text).replace(/(<([^>]+)>)/ig,"");
            var snippet = text;
            if (text.length > wanted_length) {
                snippet = text.slice(0, wanted_length);

                var last_space = snippet.lastIndexOf(" ");
                snippet = text.slice(0, last_space);

                if (snippet.length < text.length) {
                    snippet += "…";
                }
            }
            return snippet;
        },
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
        ago: function (date) {
            return moment(date).fromNow();
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
        calendardatetime: function (date) {
            if (date) {
                return moment(date).format('YYYY-MM-DD HH:mm');
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
                    if (startm.isSame(startd) && endm.isSame(endd)) {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                    }
                    else {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
                    }
                }
                else {
                    if (startm.isSame(startd) && endm.isSame(endd)) {
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
                startd = moment(startm).startOf('day');
                if (startm.isSame(startd, 'second')) {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
                }
            }
            else if (end) {
                // only end
                endm = moment(end);
                endd = moment(endm).startOf('day');
                if (endm.isSame(endd, 'second')) {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                }
            }
        },
        permission_options: function () {
            var active_user = this.get('active_user');
            var selected_permissions = this.get('event.permissions');

            // public
            var retval = '<select id="permissions" class="chosen-permissions" name="permissions" multiple data-placeholder="Velg hvem som skal kunne se innlegget"><optgroup label="Alle">';
            if (selected_permissions.public) {
                retval += '<option value="p" selected>Verden</option>';
            } else {
                retval += '<option value="p">Verden</option>';
            }
            retval += '</optgroup>';

            // groups
            retval += '<optgroup label="Grupper">';
            _.each(active_user.groups, function (group) {
                if (_.contains(selected_permissions.groups, group._id)) {
                    retval += '<option value="g-'+group._id+'" selected>' + group.name + '</option>';
                } else {
                    retval += '<option value="g-'+group._id+'">' + group.name + '</option>';
                }
            });
            retval += '</optgroup>';

            // friends
            retval += '<optgroup label="Personer">';
            _.each(active_user.friends, function (user) {
                if (_.contains(selected_permissions.users, user._id)) {
                    retval += '<option value="u-'+user._id+'" selected>';
                } else {
                    retval += '<option value="u-'+user._id+'">';
                }
            });
            retval += '</optgroup>';
            retval += '</select>';
            console.log(retval);

            return retval;
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
    fetchProjects: function () {
        this.subtract('year');

        var year = this.get('year');

        return $.ajax({
            url: '/' + year + '/',
            type: 'GET'
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
    updateEvent: function (event) {
        return $.ajax({
            type: 'PUT',
            url: window.location.href,
            data: {
                title: event.title,
                mdtext: event.mdtext,
                start: event.start,
                end: event.end,
                permissions: event.permissions,
                location: event.location
            }
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

module.exports.projectListView = function (projects, previous_projects) {
    var internal_editor, uploadzone;

    var projectlist = new Project({
        el: '#projects',
        template: '#template',
        data: {
            projects: projects,
            previous_projects: previous_projects
        }
    });

    projectlist.on('setSlug', function (event) {
        var node = $(event.node);
        projectlist.set('project.slug', uslug(node.val()));
    });

    projectlist.on('toggleNew', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (projectlist.get('expanded')) {
                internal_editor = setup_editor('#private_mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
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

    projectlist.on('fetchProjects', function(event){
        event.original.preventDefault();
        projectlist.fetchProjects()
        .then(function(data){
            if (data.length === 0){
                self.set('gotall', true);
            }
            projectlist.get('previous_projects').push.apply(projectlist.get('previous_projects'), data);
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
        internal_editor,
        post_editor,
        event_editor;

    project.on('toggleEdit', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (project.get('expanded')) {
                internal_editor = setup_editor('#private_mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
            }
            /*else {
                project.setup_uploadzone('#upload', '#add_file');
            }*/
        }, 1);
    });

    project.on('updateProject', function (event) {
        event.original.preventDefault();
        internal_editor.codemirror.save(); //toTextArea();
        event.context.project.private_mdtext = $('#private_mdtext').val();
        event.context.project.permissions = $('#permissions').val();

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
        setTimeout(function(){
            if (project.get('postExpanded')) {
                post_editor = setup_editor('#post_mdtext');
            }
        }, 1);
    });

    project.on('createPost', function (event) {
        event.original.preventDefault();
        post_editor.codemirror.save(); //toTextArea();
        event.context.post.mdtext = $('#post_mdtext').val();

        project.createPost(event.context.post, event.node.action)
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i forum');
            project.get('posts').unshift(data);
            project.set('post', {});
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
        setTimeout(function(){
            if (project.get('eventExpanded')) {
                $('#event_start').fdatetimepicker({language: 'nb', weekStart: 1, format: 'yyyy-mm-dd hh:ii'});
                $('#event_end').fdatetimepicker({language: 'nb', weekStart: 1, format: 'yyyy-mm-dd hh:ii'});
            }
        }, 1);
    });

    project.on('createEvent', function (event) {
        event.original.preventDefault();
        event.context.event.start = $('#event_start').val();
        event.context.event.end = $('#event_end').val();

        project.createEvent(event.context.event, event.node.action)
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i kalenderen');
            project.get('events').unshift(data);
            project.set('event', {});
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
    var event_list = new Project({
        el: '#events',
        template: '#template',
        data: {
            events: events
        }
    });
};

module.exports.eventView = function (event, active_user) {
    var project = new Project({
            el: '#event',
            template: '#template',
            data: {
                event: event,
                active_user: active_user
            }
        }),
        editor;

    project.on('toggleEdit', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (project.get('expanded')) {
                editor = setup_editor('#mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
                $('#start').fdatetimepicker({language: 'nb', weekStart: 1, format: 'yyyy-mm-dd hh:ii', closeButton: false});
                $('#end').fdatetimepicker({language: 'nb', weekStart: 1, format: 'yyyy-mm-dd hh:ii', closeButton: false});
            }
        }, 1);
    });

    project.on('updateEvent', function (event) {
        event.original.preventDefault();
        event.context.event.start = $('#start').val();
        event.context.event.end = $('#end').val();
        event.context.event.permissions = $('#permissions').val();
        editor.codemirror.save();
        event.context.event.mdtext = $('#mdtext').val();

        project.updateEvent(event.context.event)
        .then(function (data) {
            project.fire('toggleEdit');
            project.set('event', data);
        }, function (xhr, status, err) {
            console.error(err);
            //project.get('error').push(err);
        });
    });

    return project;
};
