var request = require('superagent');

module.exports.postcode = function (req, res) {
    if (req.params.postcode && req.params.postcode.match(/\d{4}/)) {
        request
            .get('http://adressesok.posten.no/api/v1/postal_codes.json?postal_code=' + req.params.postcode)
            .end(function (error, result) {
                var data = result.body;
                if (data.status !== "ok") {
                    res.json(404);
                } else {
                    res.json(200, data.postal_codes[0]);
                }
        });
    } else {
        res.json(500);
    }
};
