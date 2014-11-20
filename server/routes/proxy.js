var express = require('express'),
    router = express.Router(),
    fetch_city = require('../lib/util').fetch_city;

router.get('/postcode/:postcode', function (req, res) {
    fetch_city(req.params.postcode, function (err, city) {
        if (err) {
            if (err === "notfound") {
                res.sendStatus(404);
            }
            else {
                // not a valid request
                res.sendStatus(500);
            }
        }
        else {
            res.json(city);
        }
    });
});

module.exports = router;
