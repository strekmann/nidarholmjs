const crypto = require('crypto');

function encrypt(data, key, callback) {
    const cipher = crypto.createCipheriv('AES-256-CBC', key, key.slice(0, 16));
    callback(null, cipher.update(data, 'utf8', 'base64') + cipher.final('base64'));
}

function decrypt(data, key, callback) {
    const d = data.replace(/-/g, '+').replace(/_/g, '/');
    const cipher = crypto.createDecipheriv('aes-256-cbc', key, key.slice(0, 16));
    callback(null, cipher.update(d, 'base64', 'utf8') + cipher.final('utf8'));
}

/*
var test = function (data) {
    var key = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    encrypt(data, key, function (err, data) {
        console.log(data);
        decrypt(data, key, function (err, data) {
            console.log(data);
        });
    });
};
*/

module.exports.aes = {
    encrypt,
    decrypt,
};
