module.exports.h2b64 = function(hex){
    return new Buffer(hex, 'hex').toString('base64').replace('+', '-').replace('/', '_');
};

module.exports.b642h = function(b64){
    return new Buffer(b64.replace('-','+').replace('_','/'), 'base64').toString('hex');
};
