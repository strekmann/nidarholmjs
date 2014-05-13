var Forum = require('./ractive/forum');

var checkAreaSize = function(openSize) {
    return function(event){
        var type = event.original.type,
            elem = $(event.node);

        if (type === 'focus' && elem.val().trim().length === 0){
            elem.css('height', openSize);
        } else if (type === 'focus' && elem.val().trim().length > 100) {
            elem.css('height', openSize);
        } else if (elem.val().trim().length === 0){
            elem.css('height', '');
        }
    };
};

module.exports.threadView = function(post, active_user){
    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/forum',
        data: {
            post: post,
            active_user: active_user,
            permission_options: function () {
                var active_user = forum.get('active_user');
                var selected_permissions = forum.get('post.permissions');

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

                return retval;
            }
        }
    });

    forum.on('addReply', function(event){
        var reply = {
            mdtext: $('#reply').val()
        };
        forum.addReply(reply);
        $('#reply').val('');
    });

    forum.on('deleteReply', function(event){
        forum.deleteReply({_id: event.context._id});
    });

    forum.on('addComment', function(event){
        var text = $(event.node).siblings('textarea').val();
        var comment = {
            mdtext: text
        };

        forum.addComment(event.context._id, comment);
        $(event.node).siblings('textarea').val('');
    });

    forum.on('deleteComment', function(event){
        var replyid = this.data.post.replies[event.keypath.split('.')[2]]._id;
        forum.deleteComment(replyid, {_id: event.context._id});
    });

    forum.on('updatePost', function (event) {
        event.original.preventDefault();

        var post = {
            title: $('#title').val(),
            mdtext: $('#mdtext').val(),
            tags: $('#tags').val(),
            permissions: $('#permissions').val()
        };
        var promise = forum.updatePost(post);
        promise.then(function (data) {
            forum.set('post', data);
            forum.toggle('is_editing');
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    forum.on('toggleEdit', function (event) {
        this.toggle('is_editing');
        var format = function (item) {
            return item.name;
        };
        setTimeout(function(){
            if (forum.get('is_editing')) {
                $('.chosen-permissions').chosen({width: '100%'});
            }
        }, 1);
    });

    forum.on('checkAreaSize', checkAreaSize('6rem'));
    forum.on('checkLargeAreaSize', checkAreaSize('16rem'));

    return forum;
};

module.exports.forumView = function (posts) {
    var ace_edit,
        forum = new Forum({
            el: '#forum',
            template: '#template',
            restAPI: '/forum'
        });

    forum.set('posts', posts);

    forum.on('addPost', function (event) {
        event.original.preventDefault();

        var node = $(event.node),
            post = {
                title: node.find('#title').val(),
                mdtext: ace_edit.getSession().getValue(),
                permissions: node.find('#permissions').val()
            };

        var promise = forum.addPost(post);

        promise.then(function (data) {
            forum.data.posts.unshift(data);
            forum.toggle('expanded');
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    forum.on('deletePost', function(event){
        event.original.preventDefault();
        var promise = forum.deletePost(event.context);

        promise.then(function(data){
            var index = event.keypath.split('.').pop();
            forum.data.posts.splice(index, 1);
        }, function(xhr, status, err){
            console.error(err);
        });
    });

    forum.on('fetchPosts', function(event){
        event.original.preventDefault();
        forum.fetchPosts();
    });

    forum.on('toggleNew', function(event){
        this.toggle('expanded');

        setTimeout(function(){
            if (forum.get('expanded')){
                $('.chosen-permissions').chosen({width: '100%'});
                ace_edit = ace.edit('mdtext');
                ace_edit.setTheme('ace/theme/tomorrow');
                ace_edit.getSession().setMode('ace/mode/markdown');
                ace_edit.getSession().setUseWrapMode(true);

                $('#mdtext textarea').attr('id', 'mdtext-ace');

                ace_edit.on('change', function(e){
                    // only update ractive data if preview is visible
                    if($('#mdpreview').is(':visible')){
                        forum.set('mdpreview', ace_edit.getValue());
                    }
                });
            }
        }, 1);
    });

    return forum;
};
