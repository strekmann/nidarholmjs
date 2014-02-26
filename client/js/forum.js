module.exports.threadView = function(){
    var Forum = require('./ractive/forum');

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
    });

    forum.on('deleteComment', function(event){
        var replyid = this.data.post.replies[event.keypath.split('.')[2]]._id;
        forum.deleteComment(replyid, {_id: event.context._id});
    });

    return forum;
};

module.exports.forumView = function () {
    $('#newpostform').hide();
    $('#newpostform').on('submit', function (event) {
        var title = $('#newpostform #title').val(),
            mdtext = $('#newpostform #mdtext').val();

        event.preventDefault();
        $.ajax({
            url: '/forum',
            type: 'post',
            data: {
                title: title,
                mdtext: mdtext
            },
            success: function (data) {
                $('#newpostform').slideUp();
                $('#newpost').show();
                $('#forum').append('<div class="post" data-id="' + data._id + '"><h1><a href="/forum/' + data._id + '">' + data.title + '</a></h1><div class="meta">Av ' + data.creator.name + ' ' + data.created + '</div>' + data.mdtext + '<form><button class="deletepost" type="button">Slett innlegg</button></div>');
            }
        });
    });
    $('#newpost').on('click', function (event) {
        $('#newpostform').slideDown();
        $('#newpost').hide();
    });
    $('#cancelpost').on('click', function (event) {
        $('#newpostform').slideUp();
        $('#newpost').show();
    });
    $('#forum').on('click', '.deletepost', function (event) {
        var post = $(this).parents('.post');
        var id = post.attr('data-id');
        $.ajax({
            url: '/forum/' + id,
            type: 'delete',
            success: function (data) {
                $('#flash').append('<div data-alert class="columns alert-box success">' + data.title + ' er slettet</div>');
                post.remove();
            }
        });
    });
};
