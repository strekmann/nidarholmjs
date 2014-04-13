module.exports = {
    indexView: function(activities){
        var ractive = new Ractive({
            el: '#ractive',
            template: '#tmpl-test'
        });

        var ractive_activities = new Ractive({
            el: '#activities',
            template: '#activity-template',
            data: {
                activities: activities,
                ago: function (date) {
                    return moment(date).from();
                }
            }
        });
    }
};
