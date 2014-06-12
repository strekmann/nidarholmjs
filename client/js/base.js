module.exports = {
    indexView: function(activities){
        var ractive_activities = new Ractive({
            el: '#activities',
            template: '#activity-template',
            data: {
                activities: activities,
                ago: function (date) {
                    return moment(date).from();
                },
                marked: function (text) {
                    return marked(text);
                },
                last: function (array) {
                    return array.slice(-1)[0];
                }
            }
        });
    }
};
