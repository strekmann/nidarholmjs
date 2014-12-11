var crypto = require('crypto');

var encrypt = function (data, key, callback) {
    var cipher = crypto.createCipheriv('AES-256-CBC', key, key.slice(0,16));
    callback(null, cipher.update(data, 'utf8', 'base64') + cipher.final('base64'));
};

var decrypt = function (data, key, callback) {
    data = data.replace(/\-/g, '+').replace(/_/g, '/');
    var cipher = crypto.createDecipheriv('aes-256-cbc', key, key.slice(0,16));
    callback(null, cipher.update(data, 'base64', 'utf8') + cipher.final('utf8'));
};

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
    encrypt: encrypt,
    decrypt: decrypt
};
