module.exports.threadView = function(){
    var Forum = require('./ractive/forum');

    var forum = new Forum({
        el: '#forum',
        template: '#template',
        restAPI: '/api/forum'
    });

    console.log('forum', forum);
    console.log('post', forum.get('post'));
};
