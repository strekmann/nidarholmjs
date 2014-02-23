module.exports.threadView = function(){
    var Forum = require('./ractive/forum');

    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/api/forum'
    });

    console.log('forum', forum);
    console.log('post', forum.get('post'));

    forum.on('addReply', function(event){
        var reply = {
            mdtext: 'ny reply #' + new Date().getTime()
        };
        console.log('event', event);
        forum.addReply(reply);
    });

    forum.on('addComment', function(event){
        var comment = {
            mdtext: 'super kommentar #'+ new Date().getTime()
        };

        console.log('comment event', event);
        forum.addComment(event.context._id, comment);
    });

    forum.on('removeReply', function(event){
        forum.deleteReply({_id: 'newID'});
    });

    forum.on('removeComment', function(event){
        forum.deleteComment('newID', {_id: 'newCommentID'});
    });

    return forum;
};
