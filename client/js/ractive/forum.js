var Forum = Ractive.extend({
    restAPI: '/api/forum',

    // Will be called as soon as the instance has finished rendering.
    init: function(){

    },

    addReply: function(reply){
        this.data.replies.unshift(reply);
    },

    deleteReply: function(reply){
        var index = _.indexOf(_.pluck(this.data.post.replies, '_id'), reply._id);
        if (index !== -1){
            this.data.post.replies.splice(index, 1);
        }
    },

    addComment: function(replyid, comment){
        var replyIndex = _.indexOf(_.pluck(this.data.post.replies, '_id'), replyid);
        this.data.post.replies[replyIndex].push(comment);
    },

    deleteComment: function(replyid, comment){
        var replyIndex = _.indexOf(_.pluck(this.data.post.replies, '_id'), replyid);
        var commentIndex = _.indexOf(_.pluck(this.data.post.replies[replyIndex], '_id'), replyid);
        if (commentIndex !== -1){
            this.data.post.replies[replyIndex].comments.splice(commentIndex, 1);
        }
    },

    data: {
        post: {
            title: 'Test tråd',
            creator: 'bergquis',
            created: new Date(Date.now() - 3600000),
            modified: new Date(),
            tags: ['test', 'ractive'],
            mdtext:'# Test\n\nIkke bare bare',
            permissions: {
                groups: [],
                users: []
            },
            replies: [
                {
                    creator: 'sigurdga',
                    created: new Date(Date.now() - 3000000),
                    mdtext: 'Kjempebra! Stå på.',
                    comments: [
                        {
                            creator: 'bergquis',
                            created: new Date(Date.now() - 2700000),
                            mdtext: 'Ja, ikke sant :D'
                        },
                        {
                            creator: 'persverr',
                            created: new Date(Date.now() - 2700000),
                            mdtext: 'nah, AngularJS ftw!'
                        }
                    ]
                }
            ]
        }
    }
});

module.exports = Forum;
