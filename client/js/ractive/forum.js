var Forum = Ractive.extend({
    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/forum';
    },

    addPost: function(post) {
        var url = this.restAPI,
            promise = $.ajax({
                url: url,
                type: 'post',
                data: post,
                });

        return promise;
    },

    deletePost: function(post){
        var self = this,
            url = [this.restAPI, post._id],
            promise = $.ajax({
                url: url.join('/'),
                type: 'DELETE'
            });
        return promise;
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
                self.data.post.replies.splice(index, 1);
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

    fetchPosts: function(){
        this.add('page', 1);

        var self = this,
            url = [this.restAPI],
            promise = $.ajax({
                url: url.join('/'),
                type: 'GET',
                data: {page: this.get('page')}
            });

        promise.then(function(data){
            if (data.length === 0){
                self.set('gotall', true);
            }
            self.data.posts.push.apply(self.data.posts, data);
        });
    },

    data: {
        post: {},
        posts: [],
        gotall: false,
        page: 0,

        marked: function(text){
            return marked(text);
        },
        shortdate: function(date){
            return moment(date).format('ll');
        },
        isodate: function(date){
            return moment(date).format();
        }
    }
});

module.exports = Forum;
