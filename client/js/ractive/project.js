var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/forum';
        this.set('project', options.project);
    },

    data: {
        project: {},

        marked: function(text){
            return marked(text);
        },
        shortdate: function(date){
            if (date) {
                return moment(date).format('ll');
            }
        },
        isodate: function(date){
            if (date) {
                return moment(date).format();
            }
        }
    }
});

module.exports = Project;
