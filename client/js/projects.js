// from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    onconstruct: function(options){
        this.restAPI = options.restAPI || window.location.href;
    },

    data: {
        active_user: null,
        projects: [],
        previous_projects: [],
        events: [],
        finished_events: [],
        event: null,
        pieces: [],
        piece: {},
        posts: [],
        images: [],
        non_images: [],
        year: moment().year(),

        startdate: function () {
            var event = this.get('event');
            if (event && event.start) {
                return moment(event.start).format("YYYY-MM-DD");
            }
        },
        starttime: function () {
            var event = this.get('event');
            if (event && event.start) {
                return moment(event.start).format("HH:mm");
            }
        },
        enddate: function () {
            var event = this.get('event');
            if (event && event.end) {
                return moment(event.end).format("YYYY-MM-DD");
            }
        },
        endtime: function () {
            var event = this.get('event');
            if (event && event.end) {
                return moment(event.end).format("HH:mm");
            }
        },

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
            if (date) {
                return moment(date).fromNow();
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
                    //console.log(startm, startd, startm.isSame(startd));
                    //console.log(endm, endd, endm.isSame(endd));
                    // saving dates should always set startOf('day') AND later wholeday
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
            //console.log(retval);

            return retval;
        },
        pretty_piece: function (piece) {
            var res = "<b>" + piece.title + "</b>";
            if (piece.subtitle) {
                res += " " + piece.subtitle;
            }
            if (piece.composers.length || piece.arrangers.length) {
                res += " (";
                if (piece.composers.length) {
                    res += "<b>" + piece.composers.join(", ") + "</b>";
                }
                if (piece.composers.length && piece.arrangers.length) {
                    res += ", ";
                }
                if (piece.arrangers.length) {
                    res += piece.arrangers.join(", ");
                }
                res += ")";
            }
            return res;
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
    fetchSeasonEvents: function () {
        var season = this.get('season');
        return $.ajax({
            url: '/events?y=' + season,
            type: 'GET',
            dataType: 'json',
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
            data: _.pick(event, 'title', 'mdtext', 'start', 'end', 'permissions', 'location', 'tags')
        });
    },
    deleteEvent: function (event) {
        return $.ajax({
            type: 'DELETE',
            url: window.location.href,
            dataType: 'json'
        });
    },
    createPiece: function (piece, project) {
        piece.project = this.get('project._id');
        return $.ajax({
            type: 'POST',
            url: '/music',
            data: piece
        });
    },
    removePiece: function (music) {
        var project = this.get('project');
        return $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: '/projects/' + project._id + '/music',
            data: _.pick(music, '_id')
        });
    },
    addPiece: function (piece) {
        var project = this.get('project');
        return $.ajax({
            type: 'PUT',
            dataType: 'json',
            url: '/projects/' + project._id + '/music',
            data: piece
        });
    },
    setup_uploadzone: function (element_id, clickable_element_id) {
        var project = this;

        if ($(element_id).length && $(clickable_element_id).length) {
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
    }
});

var setup_editor = function (element_id) {
    return new Editor({element: $(element_id)[0]});
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
        // TODO: Keep state 'changed manually', use this when updating title.
        // Should be checked on tag.blur.
        var node = $(event.node);
        projectlist.set('project.tag', uslug(node.val()));
    });

    projectlist.on('toggleNew', function (event) {
        this.toggle('expanded');
        setTimeout(function(){
            if (projectlist.get('expanded')) {
                internal_editor = setup_editor('#private_mdtext');
                $('.chosen-permissions').chosen({width: '100%'});
                $('#startdate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
                    projectlist.set('project.start', moment(context.select).startOf('day').toISOString());
                }});
                $('#enddate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
                    projectlist.set('project.end', moment(context.select).startOf('day').toISOString());
                }});
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
            flash.get('error').push(xhr.responseJSON.error);
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

module.exports.projectDetailView = function (p, events, posts, files) {

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

    // separate events in upcoming and finished for project that has not finished
    var now = moment(),
        upcoming = [],
        finished = [];

    if (p && moment(p.end) > now) {
        _.each(events, function (event) {
            var start = moment(event.start);
            if (start > now) {
                upcoming.push(event); //upcoming

                // expand event info for events in the next 10 days
                var limit = moment().add(10, 'days');
                if (start < limit) {
                    event.toggled = true;
                }
            } else {
                finished.push(event); //finished
            }
        });
    }
    else {
        upcoming = events;
    }
    var project_internal_editor,
        project_external_editor,
        post_editor,
        event_editor;

    // Project modal section
    var projectmodal = new Ractive({
        el: '#project-modal',
        template: '#project-modal-template',
        data: {
            description: 'internal',
            isodate: function(date){
                if (date) {
                    return moment(date).format("YYYY-MM-DD");
                }
            },
            dereference_permissions: function (permissions) {
                var ret = [];
                _.each(permissions.groups, function (g) {
                    ret.push("g-"+g);
                });
                _.each(permissions.users, function (u) {
                    ret.push("u-"+u);
                });
                if (permissions.public) {
                    ret.push("p");
                }
                return ret;
            }
        }
    });

    projectmodal.on('close', function (event) {
        event.original.preventDefault();
        $('#project-modal').foundation('reveal', 'close');
    });

    projectmodal.on('updateProject', function (event) {
        event.original.preventDefault();
        if (project_internal_editor) {
            event.context.project.private_mdtext = project_internal_editor.codemirror.getValue() || event.context.project.private_mdtext;
        }
        if (project_external_editor) {
            event.context.project.public_mdtext = project_external_editor.codemirror.getValue() || event.context.project.public_mdtext;
        }
        console.log(event.context);
        event.context.project.permissions = $('#permissions').val();

        projects.updateProject(event.context.project)
        .then(function(data) {
            // ok
            projects.set('project', data);
            $('#project-modal').foundation('reveal', 'close');
        }, function (xhr, status, err) {
            eventmodal.set('error', err.responseJSON.error);
        });
    });

    projectmodal.on('setInternal', function (event) {
        event.original.preventDefault();
        projectmodal.set('description', 'internal');
        project_internal_editor = setup_editor('#private_mdtext');
    });

    projectmodal.on('setExternal', function (event) {
        event.original.preventDefault();
        projectmodal.set('description', 'external');
        project_external_editor = setup_editor('#public_mdtext');
    });

    $(document).on('opened.fndtn.reveal', '#project-modal[data-reveal]', function () {
        if (!project_internal_editor) {
            project_internal_editor = setup_editor('#private_mdtext');
        }
    });

    // Event modal section
    var eventmodal = new Ractive({
        el: '#event-modal',
        template: '#event-modal-template',
        data: {
            startdate: function () {
                var event = this.get('event');
                if (event && event.start) {
                    return moment(event.start).format("YYYY-MM-DD");
                }
            },
            starttime: function () {
                var event = this.get('event');
                if (event && event.start) {
                    return moment(event.start).format("HH:mm");
                }
            },
            enddate: function () {
                var event = this.get('event');
                if (event && event.end) {
                    return moment(event.end).format("YYYY-MM-DD");
                }
            },
            endtime: function () {
                var event = this.get('event');
                if (event && event.end) {
                    return moment(event.end).format("HH:mm");
                }
            }
        }
    });

    eventmodal.on('close', function (event) {
        event.original.preventDefault();
        $('#event-modal').foundation('reveal', 'close');
    });

    eventmodal.on('create', function (event) {
        event.original.preventDefault();
        projects.createEvent(event.context.event, '/projects/' + projects.get('project._id') + '/events')
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i kalenderen');
            projects.get('events').unshift(data);
            projects.set('event', {});
            $('#event-modal').foundation('reveal', 'close');
        }, function(err){
            eventmodal.set('error', err.responseJSON.error);
        });
    });

    // Post modal section
    var postmodal = new Ractive({
        el: '#post-modal',
        template: '#post-modal-template'
    });

    postmodal.on('close', function (event) {
        event.original.preventDefault();
        $('#event-modal').foundation('reveal', 'close');
    });

    postmodal.on('create', function (event) {
        event.original.preventDefault();
        post_editor.codemirror.save(); //toTextArea();
        event.context.post.mdtext = $('#post_mdtext').val();

        projects.createPost(event.context.post, '/projects/' + projects.get('project._id') + '/forum')
        .then(function (data) {
            flash.data.success.push(data.title + ' ble lagt til i forum');
            projects.get('posts').unshift(data);
            projects.set('post', {});
            $('#post-modal').foundation('reveal', 'close');
        }, function(xhr, status, err){
            eventmodal.set('error', err.responseJSON.error);
        });
    });
    $(document).on('opened.fndtn.reveal', '#post-modal[data-reveal]', function () {
        if (!post_editor) {
            post_editor = setup_editor('#post_mdtext');
        }
    });

    // Music modal section
    var musicmodal = new Ractive({
        el: '#music-modal',
        template: '#music-modal-template'
    });

    musicmodal.on('close', function (event) {
        event.original.preventDefault();
        $('#music-modal').foundation('reveal', 'close');
    });

    musicmodal.on('addPiece', function (event) {
        event.original.preventDefault();
        projects.addPiece(event.context.piece)
        .then(function (data) {
            projects.get('music').push(data);
            projects.set('piece', {});
            $('#music-modal').foundation('reveal', 'close');
        });
    });

    musicmodal.on('createPiece', function (event) {
        event.original.preventDefault();
        projects.createPiece(event.context.piece)
        .then(function (data) {
            projects.get('music').unshift(data);
            projects.set('piece', {});
            $('#music-modal').foundation('reveal', 'close');
        }, function(xhr, status, err){
            console.log(xhr, status, err);
            //eventmodal.set('error', err.responseJSON.error);
        });
    });

    // Project section
    var projects = new Project({
            el: '#project',
            template: '#template',
            restAPI: '/projects/' + p._id,
            data: {
                project: p,
                events: upcoming,
                finished_events: finished,
                posts: posts,
                images: images,
                non_images: non_images,
                music: p.music,
                description: 'internal'
            }
        });

    projects.on('editProject', function (event) {
        var project = _.clone(event.context.project);
        projectmodal.set('project', project);
        projectmodal.set('error', undefined);
        $('#project-modal').foundation('reveal', 'open');
        $('.chosen-permissions').chosen({width: '100%'});
        $('#startdate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
            projectmodal.set('project.start', moment(context.select).startOf('day').toISOString());
        }});
        $('#enddate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
            projectmodal.set('project.end', moment(context.select).startOf('day').toISOString());
        }});
    });

    projects.on('setInternal', function (event) {
        event.original.preventDefault();
        projects.set('description', 'internal');
    });

    projects.on('setExternal', function (event) {
        event.original.preventDefault();
        projects.set('description', 'external');
    });

    projects.on('toggleFinishedEvents', function (event){
        event.original.preventDefault();
        projects.toggle('expanded_finished');
    });

    projects.on('newEvent', function (event) {
        eventmodal.set('event', {});
        eventmodal.set('error', undefined);
        $('#event-modal').foundation('reveal', 'open');
        $('#event_startdate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
            var oldstart = eventmodal.get('event.start');
            if (oldstart) {
                var old = moment(oldstart);
                eventmodal.set('event.start', moment(context.select).add("hours", old.hour()).add("minutes", old.minute()).toISOString());
            }
            else {
                eventmodal.set('event.start', moment(context.select).hour(0).minute(0).toISOString());
            }
        }});
        $('#event_starttime').pickatime({formatLabel: 'HH:i', format: 'HH:i', editable: true,  onSet: function (context) {
            var old = moment(eventmodal.get('event.start'));
            eventmodal.set('event.start', old.hour(0).minute(0).add("minutes", context.select).toISOString());
        }});
        $('#event_enddate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
            var oldend = eventmodal.get('event.end');
            if (oldend) {
                var old = moment(eventmodal.get('event.end'));
                eventmodal.set('event.end', moment(context.select).add("hours", old.hour()).add("minutes", old.minute()).toISOString());
            }
            else {
                eventmodal.set('event.end', moment(context.select).hour(0).minute(0).toISOString());
            }
        }});
        $('#event_endtime').pickatime({formatLabel: 'HH:i', format: 'HH:i', editable: true,  onSet: function (context) {
            var old = moment(eventmodal.get('event.end'));
            eventmodal.set('event.end', old.hour(0).minute(0).add("minutes", context.select).toISOString());
        }});
    });

    projects.on('toggleEvent', function (event) {
        projects.toggle(event.keypath + '.toggled');
    });

    projects.on('newPost', function (event) {
        postmodal.set('post', {});
        postmodal.set('serror', undefined);
        $('#post-modal').foundation('reveal', 'open');
    });

    projects.on('newPiece', function (event) {
        musicmodal.set('piece', {});
        musicmodal.set('error', undefined);
        $('#music-modal').foundation('reveal', 'open');
        $('#piece_id').select2({
            width: '100%',
            minimumInputLength: 2,
            ajax: {
                url: "/music",
                dataType: "json",
                quietMillis: 100,
                data: function (term, page) {
                    return {
                        q: term
                    };
                },
                results: function (data, page) {
                    return {results: _.map(data.pieces, function (piece) {
                        return {id: piece._id, text: piece.title};
                    })};
                }
            }
        });
        $('#piece_id').on("change", function(e) {
            musicmodal.set('.piece._id', e.val);
        });
    });

    projects.on('askRemovePiece', function (event) {
        this.toggle(event.keypath + '.askRemove');
    });

    projects.on('removePiece', function (event) {
        event.original.preventDefault();
        var index = event.keypath.split(".").pop();

        projects.removePiece(event.context)
        .then(function (data) {
            projects.get('music').splice(index, 1);
        });
    });

    /*
    projects.on('deletePost', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete',
            dataType: 'json'
        });
        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble fjernet');
            var index = event.keypath.split('.').pop();
            projects.data.project.posts.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });
    */

    /*
    projects.on('deleteEvent', function (event) {
        event.original.preventDefault();
        var promise = $.ajax({
            url: event.node.href,
            type: 'delete',
            dataType: 'json'
        });
        promise.then(function (data) {
            flash.data.success.push(data.title + ' ble fjernet fra kalenderen');
            var index = event.keypath.split('.').pop();
            projects.data.project.events.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });
    */

    projects.setup_uploadzone('#upload', '#add_file');
};

module.exports.upcomingView = function (events) {
    var event_list = new Project({
        el: '#events',
        template: '#template',
        data: {
            events: events,
            season: 1,
            gotall: false
        },
    });

    event_list.on('fetchMore', function (event) {
        event.original.preventDefault();
        var self = this;
        event_list.fetchSeasonEvents()
        .then(function (data) {
            console.log(data);
            if (!data.events.length) {
                self.set('gotall', true);
            }
            else {
                event_list.get('events').push.apply(event_list.get('events'), data.events); // merge arrays
                //event_list.get('events').push(data.events); // to add one element
            }
            self.add('season');
        });
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
                $('#startdate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
                    var old = moment(project.get('event.start'));
                    project.set('event.start', moment(context.select).add("hours", old.hour()).add("minutes", old.minute()).toISOString());
                }});
                $('#starttime').pickatime({formatLabel: 'HH:i', format: 'HH:i', editable: true,  onSet: function (context) {
                    var old = moment(project.get('event.start'));
                    project.set('event.start', old.hour(0).minute(0).add("minutes", context.select).toISOString());
                }});
                $('#enddate').pickadate({format: 'yyyy-mm-dd', formatSubmit: 'yyyy-mm-dd', onSet: function (context) {
                    var old = moment(project.get('event.end'));
                    project.set('event.end', moment(context.select).add("hours", old.hour()).add("minutes", old.minute()).toISOString());
                }});
                $('#endtime').pickatime({formatLabel: 'HH:i', format: 'HH:i', editable: true,  onSet: function (context) {
                    var old = moment(project.get('event.end'));
                    project.set('event.end', old.hour(0).minute(0).add("minutes", context.select).toISOString());
                }});
                require('s7n').tagify();
            }
        }, 1);
    });

    project.on('toggleDelete', function (event) {
        event.original.preventDefault();
        this.toggle('askDelete');
    });

    project.on('updateEvent', function (event) {
        event.original.preventDefault();
        editor.codemirror.save();
        event.context.event.mdtext = $('#mdtext').val();
        event.context.event.permissions = $('#permissions').val();
        event.context.event.tags = $('#tags').select2('val');

        project.updateEvent(event.context.event)
        .then(function (data) {
            project.fire('toggleEdit');
            project.set('event', data);
        }, function (xhr, status, err) {
            console.error(err);
            //project.get('error').push(err);
        });
    });

    project.on('deleteEvent', function (event) {
        event.original.preventDefault();
        project.deleteEvent(event.context.event)
        .then(function (data) {
            flash.data.success.push(data.title + " er slettet");
            //window.location.href = history.go(-2);
        });
    });
};

module.exports.musicView = function (p, q) {
    var project = new Project({
        el: '#music',
        template: '#template',
        data: {
            pieces: p,
            filtered: [],
            query: getParameterByName('q') || ""
        }
    });

    project.observe('query', function (query) {
        var all = project.get('pieces'),
            words = query.split(" ");

        if (query.length < 2) {
            project.set('filtered', all);
        }
        else {
            var result_arrays = _.map(words, function (word) {
                var pattern = new RegExp(word, 'i');

                var pieces = _.filter(all, function (piece) {
                    if (piece.title.match(pattern) || piece.subtitle && piece.subtitle.match(pattern)){
                        return true;
                    }
                    var composermatch = _.filter(piece.composers, function(composer) {
                        if (composer.match(pattern)) {
                            return true;
                        }
                    });
                    if (composermatch.length) {
                        return true;
                    }
                    var arrangermatch = _.filter(piece.arrangers, function(arranger) {
                        if (arranger.match(pattern)) {
                            return true;
                        }
                    });
                    if (arrangermatch.length) {
                        return true;
                    }
                });
                return pieces;
            });
            var filtered = _.intersection.apply(_, result_arrays);
            project.set('filtered', filtered);
        }
    });

    project.on('ignoreSubmit', function (event) {
        event.original.preventDefault();
        $('#filter').blur();
    });
};

module.exports.piece = function (p, g, us) {
    var scores = {};
    _.each(g, function (group) {
        scores[group._id] = group.scores;
    });
    var piece = new Ractive({
        el: '#piece',
        template: '#template',
        data: {
            piece: p,
            groups: g,
            scores: scores,
            user_scores: us
        }
    });

    Dropzone.autoDiscover = false;
    $('.sigdrop').each(function (count, el) {
        var group = $(el).find('input[name=group]').val();
        var id = '#' + $(el).attr('id');
        var drop = new Dropzone(id, {
            url: '/music/' + piece.get('piece._id') + '/scores'
        });
        var scores = piece.get('scores')[group];
        _.each(scores, function (file) {
            var mockfile = {
                name: file.filename
            };
            drop.emit('addedfile', mockfile);
            if (file.is_image) {
                drop.emit('thumbnail', mockfile, file.thumbnail_path);
            }
        });
    });
};
