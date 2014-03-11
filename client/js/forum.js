var Forum = require('./ractive/forum');

module.exports.threadView = function(){
    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/forum'
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

    forum.on('checkAreaSize', function(event){
        var type = event.original.type,
            elem = $(event.node);

        if (type === 'focus' && elem.val().trim().length === 0){
            elem.css('height', '6rem');
        } else if (elem.val().trim().length === 0){
            elem.css('height', '');
        }
    });

    return forum;
};

module.exports.forumView = function () {
    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/forum'
    });

    forum.on('addPost', function (event) {
        event.original.preventDefault();

        var node = $(event.node),
            post = {
                title: node.find('#title').val(),
                mdtext: node.find('#mdtext').val(),
                permissions: node.find('#permissions').val()
            };

        var promise = forum.addPost(post);

        promise.then(function (data) {
            forum.data.posts.unshift(data);
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

    return forum;
};
