var Forum = require('./ractive/forum');

var checkAreaSize = function(openSize) {
    return function(event){
        var type = event.original.type,
            elem = $(event.node);

        if (type === 'focus' && elem.val().trim().length === 0){
            elem.css('height', openSize);
        } else if (elem.val().trim().length === 0){
            elem.css('height', '');
        }
    };
};

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

    forum.on('checkAreaSize', checkAreaSize('6rem'));

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
                ace_edit = ace.edit('mdtext');
                ace_edit.setTheme('ace/theme/tomorrow');
                ace_edit.getSession().setMode('ace/mode/markdown');
            }
        }, 1);
    });

    return forum;
};
