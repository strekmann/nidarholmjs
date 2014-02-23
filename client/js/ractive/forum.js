var Forum = Ractive.extend({
    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/forum';
    },

    addReply: function(reply){
        var self = this,
            url = [this.restAPI, this.data.post._id, 'replies'],
            promise = $.ajax({
                url: url.join('/'),
                type: 'POST',
                data: reply
        });

        promise.then(function(data){
            self.data.post.replies.unshift(data);
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    deleteReply: function(reply){
        var self = this,
            url = [this.restAPI, this.data.post._id, 'replies', reply._id],
            promise = $.ajax({
                url: url.join('/'),
                type: 'DELETE'
            });

        promise.then(function(data){
            var index = _.indexOf(_.pluck(self.data.post.replies, '_id'), reply._id);
            if (index !== -1){
                this.data.post.replies.splice(index, 1);
            }
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    addComment: function(replyid, comment){
        var self = this,
            url = ['/forum', this.data.post._id, 'replies', replyid, 'comments'],
            promise = $.ajax({
                url: url.join('/'),
                type: 'POST',
                data: comment
            });

        promise.then(function(data){
            var replyIndex = _.indexOf(_.pluck(self.data.post.replies, '_id'), replyid);
            self.data.post.replies[replyIndex].comments.push(comment);
        }, function(xhr, status, err){
            console.error(err);
        });
    },

    deleteComment: function(replyid, comment){
        var self = this,
            url = [this.restAPI, this.data.post._id, 'replies', replyid, 'comments', comment._id],
            promise = $.ajax({
                url: url.join('/'),
                type: 'DELETE'
            });

        promise.then(function(data){
            var replyIndex = _.indexOf(_.pluck(self.data.post.replies, '_id'), replyid);
            if (replyIndex === -1 || !self.data.post.replies[replyIndex].comments) {
                return;
            }
            var commentIndex = _.indexOf(_.pluck(self.data.post.replies[replyIndex].comments, '_id'), comment._id);
            if (commentIndex !== -1){
                self.data.post.replies[replyIndex].comments.splice(commentIndex, 1);
            }
        }, function(xhr, status, err){
            console.error(err);
        });
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
