var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    util = require('../lib/util'),
    CalendarEvent = require('../models/projects').Event;

router.get('/', function (req, res, next) {
    // Fetch up to one year at a time in the future
    var y = req.query.y || 0,
        now = moment(),
        startyear,
        endyear,
        start,
        end,
        query;

    y = parseInt(y, 10);

    if (now.month() > 6) {
        startyear = now.year() + y;
    } else {
        startyear = now.year() + y + 1;
    }
    endyear = startyear + 1;

    if (!y) {
        start = moment().startOf('day');
    } else {
        start = moment().month(7).date(1).year(startyear).startOf('day');
    }
    end = moment().month(7).date(1).year(endyear).startOf('day');

    if (req.user) {
        query = CalendarEvent.find().or([
            {creator: req.user},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    } else {
        query = CalendarEvent.find({'permissions.public': true});
    }
    query = query
        .where({start: {$gte: start, $lte: end}})
        .sort('start')
        .populate('creator', 'username name');
    query.exec(function (err, events) {
        if (err) { return next(err); }
        res.format({
            html: function () {
                res.render('projects/events', {events: events, meta: {title: "Aktiviteter"}});
            },
            json: function () {
                res.json({events: events});
            }
        });
    });
});

router.get('/:id', function (req, res, next) {
    var query;
    if (req.user) {
        query = CalendarEvent.findById(req.params.id)
            .or([
                {creator: req.user._id},
                {'permissions.public': true},
                {'permissions.users': req.user._id},
                {'permissions.groups': { $in: req.user.groups }}
            ]);
    } else {
        query = CalendarEvent.findById(req.params.id).where({'permissions.public': true});
    }
    query.exec(function (err, event) {
        if (err) { return next(err); }
        if (!event) {
            res.send(404, 'Not found');
        } else {
            res.format({
                html: function () {
                    res.render('projects/event', {event: event, meta: {title: event.title}});
                }
            });
        }
    });
});

router.put('/:id', function (req, res, next) {
    CalendarEvent.findById(req.params.id)
        .or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]).exec(function (err, event) {
            if (err) { return next(err); }
            if (!event) {
                res.send(400, 'Not found');
            }
            else {
                event.title = req.body.title;
                event.mdtext = req.body.mdtext;
                event.permissions = util.parse_web_permissions(req.body.permissions);
                event.tags = req.body.tags;
                event.start = req.body.start;
                event.end = req.body.end;
                event.modified = moment();
                event.location = req.body.location;
                event.save(function (err) {
                    if (err) {
                        res.status(400).json(err);
                    }
                    else {
                        res.json(event);
                    }
                });
            }
        });
});

router.delete('/:id', function (req, res, next) {
    if (req.user) {
        CalendarEvent.findByIdAndRemove(req.params.id).or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]).exec(function (err, event) {
            if (err) { return next(err); }
            res.json(event);
        });
    }
    else {
        res.render('403');
    }
});

module.exports = router;
