var express = require('express'),
    is_member = require('../lib/middleware').is_member,
    Page = require('../models/pages').Page,
    shortid = require('short-mongo-id'),
    moment = require('moment'),
    router = express.Router();

router.get('/:slug/edit', is_member, function (req, res, next) {
    Page.findOne({slug: req.params.slug}, function (err, page) {
        if (err) { return next(err); }
        if (!page.permissions.public) {
            return res.sendStatus(403);
        }
        return res.render('pages/edit', {page: page});
    });
});
router.post('/:slug/edit', is_member, function (req, res, next) {
    Page.findOne({slug: req.params.slug}, function (err, page) {
        if (err) { return next(err); }
        page.mdtext = req.body.mdtext;
        page.slug = req.body.slug;
        page.updated = moment.utc();
        page.updator = req.user._id;
        page.save(function (err, page) {
            if (err) { return next(err); }
            return res.redirect('/' + page.slug);
        });
    });
});
router.get('/:slug/create', is_member, function (req, res, next) {
    Page.findOne({slug: req.params.slug}, function (err, page) {
        if (err) { return next(err); }
        if (page) {
            return res.sendStatus(403);
        }
        page = new Page();
        page._id = shortid();
        page.slug = req.params.slug;
        page.save(function (err, page) {
            if (err) { return next(err); }
            return res.redirect('/' + page.slug);
        });
    });
});

router.get('/:slug', function (req, res, next) {
    Page.findOne({slug: req.params.slug})
    .populate('updator', 'name')
    .exec(function (err, page) {
        if (err) { return next(err); }
        if (!page) {
            return res.sendStatus(404);
        }
        if (!page.permissions.public) {
            return res.sendStatus(403);
        }
        return res.render('pages/page', { page: page });
    });
});

module.exports = router;
