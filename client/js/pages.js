/* globals $, SimpleMDE */

var setup_editor = function (element_id) {
    return new SimpleMDE({element: $(element_id)[0]});
};

module.exports.pageEditView = function (_page) {
    setup_editor('#mdtext');
    /*
    var page = new Ractive({
        el: '#page',
        template: '#template',
        data: {
            page: _page,
        }
    });
    return page;
    */
};
