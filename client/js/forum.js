module.exports.threadView = function(){
    var Forum = require('./ractive/forum');

    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/forum'
    });

    forum.on('addReply', function(event){
        var reply = {
            mdtext: 'ny reply #' + new Date().getTime()
        };
        forum.addReply(reply);
    });

    forum.on('deleteReply', function(event){
        console.log('delete reply', event.context._id);
        forum.deleteReply({_id: event.context._id});
    });

    forum.on('addComment', function(event){
        var comment = {
            mdtext: 'super kommentar #'+ new Date().getTime()
        };

        console.log('comment event', event);
        forum.addComment(event.context._id, comment);
    });

    forum.on('deleteComment', function(event){
        console.log(event);
        var replyid = this.data.post.replies[event.keypath.split('.')[2]]._id;
        console.log('reply: %s, comment: %s', replyid, event.context._id);
        forum.deleteComment(replyid, {_id: event.context._id});
    });

    return forum;
};
