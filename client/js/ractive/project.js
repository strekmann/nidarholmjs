var utils = require('../../../server/lib/util');
var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/forum';
    },

    data: {
        items: [],

        marked: function(text){
            return marked(text);
        },
        shortdate: utils.shortdate,
        isodate: function(date){
            return moment(date).format();
        }
    }
});

module.exports = Project;
