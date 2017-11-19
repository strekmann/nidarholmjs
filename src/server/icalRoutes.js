/* eslint "import/prefer-default-export": 0 */
/* eslint "new-cap": 0 */

import { toGlobalId } from 'graphql-relay';
import icalendar from 'icalendar';
import moment from 'moment';

import Event from './models/Event';

export function icalEvents(req, res, next) {
    let query = Event.find({ 'permissions.public': true });
    query = query
        .where({ start: { $gte: moment().subtract(1, 'years').startOf('day') } })
        .sort('start')
        .populate('creator', 'username name');
    query.exec((err, events) => {
        if (err) { return next(err); }

        const ical = new icalendar.iCalendar('2.0');
        ical.addProperty('VERSION', '2.0');
        ical.addProperty('PRODID', '-//Nidarholm//Aktivitetskalender//');
        ical.addProperty('X-WR-CALNAME', 'Nidarholmkalenderen');
        ical.addProperty('METHOD', 'PUBLISH');
        ical.addProperty('CALSCALE', 'GREGORIAN');
        ical.addProperty('X-ORIGINAL', 'https://nidarholm.no/events/');
        events.forEach((e) => {
            const event = new icalendar.VEvent();
            event.addProperty('UID', e.id);
            if (e.modified) {
                event.addProperty('DTSTAMP', e.modified);
            }
            else {
                event.addProperty('DTSTAMP', e.created);
            }
            event.setSummary(e.title);
            event.setDate(e.start, e.end);
            event.setDescription(e.mdtext.replace(/\r/g, '').replace(/(<([^>]+)>)/ig, ''));
            event.setLocation(e.location);
            event.addProperty('URL', `https://nidarholm.no/events/${toGlobalId('event', e.id)}`);
            ical.addComponent(event);
        });
        res.setHeader('Filename', 'nidarholm.ics');
        res.setHeader('Content-Disposition', 'attachment; filename=nidarholm.ics');
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Cache-Control', 'max-age=7200, private, must-revalidate');
        res.send(ical.toString());
        return res;
    });
}
