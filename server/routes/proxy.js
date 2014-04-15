var fetch_city = require('../lib/util').fetch_city;

module.exports.postcode = function (req, res) {
    fetch_city(req.params.postcode, function (err, city) {
        if (err) {
            if (err === "notfound") {
                res.json(404);
            }
            else {
                // not a valid request
                res.json(500);
            }
        }
        else {
            res.json(200, city);
        }
    });
};
