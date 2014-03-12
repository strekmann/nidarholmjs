var moment = require('moment');

module.exports.h2b64 = function(hex){
    return new Buffer(hex, 'hex').toString('base64').replace('+', '-').replace('/', '_');
};

module.exports.b642h = function(b64){
    return new Buffer(b64.replace('-','+').replace('_','/'), 'base64').toString('hex');
};

module.exports.isodate = function(date) {
    if (date) {
        return moment(date).format();
    }
};

module.exports.shortdate = function (date) {
    if (date) {
        return moment(date).format('ll');
    } else {
        return date;
    }
};

module.exports.longdate = function (date) {
    if (date) {
        return moment(date).format('LLL');
    }
};

module.exports.ago = function (date) {
    if (date) {
        return moment(date).fromNow();
    }
};

module.exports.set_permissions = function (permissions) {
    var permissions_obj = { 'public': false, groups: [], users: []};
    if (permissions) {
        if (Array.isArray(permissions)) {
            _.each(permissions, function (perm) {
                if (perm === "p") {
                    permissions_obj.public = true;
                } else {
                    var type_id = perm.split("-"),
                        type = type_id[0],
                        object_id = type_id[1];

                    if (type === "g") {
                        permissions_obj.groups.push(object_id);
                    } else if (type === "u") {
                        permissions_obj.users.push(object_id);
                    }
                }
            });
        } else {
            var perm = permissions;
            if (perm === "p") {
                permissions_obj.public = true;
            } else {
                var type_id = perm.split("-"),
                    type = type_id[0],
                    object_id = type_id[1];

                if (type === "g") {
                    permissions_obj.groups.push(object_id);
                } else if (type === "u") {
                    permissions_obj.users.push(object_id);
                }
            }
        }
    }
    return permissions_obj;
};
