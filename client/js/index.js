moment.lang($('html').attr('lang'));

var flash = function (messages) {
    var ractive = new Ractive({
        el: '#flash',
        template: '#flashtemplate',
        data: {
            error: messages.error || [],
            warning: messages.warning || [],
            success: messages.success || [],
            infos: messages.info || []
        }
    });

    ractive.on('closeMessage', function (event) {
        var key_num = event.keypath.split(".");
        this.data[key_num[0]].splice(key_num[1], 1);
    });

    return ractive;
};

module.exports = {
    base: require('./base'),
    forum: require('./forum'),
    organization: require('./organization'),
    groups: require('./groups'),
    user: require('./user'),
    projects: require('./projects'),
    flash: flash
};
