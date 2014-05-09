var Project = Ractive.extend({

    // Will be called as soon as the instance has finished rendering.
    init: function(options){
        this.restAPI = options.restAPI || '/api/projects';
        this.set('project', options.project);
    },

    data: {
        project: {},
        projects: [],
        gotall: false,
        page: 0,

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
        },
        daterange: function (start, end) {
            var startm, endm, startd, endd;
            if (start && end) {
                startm = moment(start);
                endm = moment(end);
                startd = moment.utc(startm).startOf('day');
                endd = moment.utc(endm).startOf('day');
                if (startm.isSame(endm, 'day')) {
                    // same day
                    if (moment.utc(startm).isSame(startd, 'second') && moment.utc(endm).isSame(endd, 'second')) {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                    }
                    else {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
                    }
                }
                else {
                    // different days
                    if (moment.utc(startm).isSame(startd, 'second') && moment.utc(endm).isSame(endd, 'second')) {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
                    }
                    else {
                        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                    }
                }
            }
            else if (start) {
                // only start
                startm = moment(start);
                startd = moment.utc(startm).startOf('day');
                if (moment.utc(startm).isSame(startd, 'second')) {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
                }
            }
            else if (end) {
                // only end
                endm = moment(end);
                endd = moment.utc(endm).startOf('day');
                if (moment.utc(endm).isSame(endd, 'second')) {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
                }
                else {
                    return '<time datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
                }
            }
        }
    }
});

module.exports = Project;
