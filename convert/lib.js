var asyncReplace = require('async-replace'),
    File = require('../server/models/files').File;

var replacer = function (match, description, path, offset, string, done) {
    //console.log(match, offset, string);
    var old_id = path.split("/").shift();
    File.findOne({old_id: old_id}, function (err, file) {
        if (err) {
            done(err);
        }
        if (file) {
            if (!description) {
                description = file.filename;
            }
            var newstring = "[![" + description + "](/files/n/" + file.hash + "/" + file.filename + ")](/files/" + file._id + ")";
            console.log(newstring);
            done(null, newstring);
            //return newstring;
        }
        else {
            console.log("replaced by nothing");
            done(null, "replaced by nothing");
            //return "replaced by nothing";
        }
    });
};

var convert_temporary_markdown_syntax = function (string, callback) {
    asyncReplace(string, /\!\[(.*?)\]\[(\d+(?:\/\d+)?)\]/g, replacer, function (err, newstring) {
        if (err){
            callback(err);
        }
        if (!newstring) {
            console.log("No match in: ", string);
        }
        if (newstring.match(/\!\[/)) {
            console.log(newstring);
        }
        if (newstring.match("replaced by nothing")) {
            console.log("we have replaced");
        }
        if (newstring.length < 5) {
            console.log("no match:", string);
        }
        callback(null, newstring);
    });
};

module.exports.convert_temporary_markdown_syntax = convert_temporary_markdown_syntax;
