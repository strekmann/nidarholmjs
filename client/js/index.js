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
