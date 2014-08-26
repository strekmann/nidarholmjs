var xls = require('xlsjs'),
    mongoose = require('mongoose'),
    Piece = require('../server/models/projects').Piece,
    _ = require('underscore'),
    shortid = require('short-mongo-id');

var workbook = xls.readFile('../data/Musikkforeningen Nidarholm - notearkiv.xls');

mongoose.connect("mongodb://localhost/nidarholm");

var sheet_name_list = workbook.SheetNames;

var sheet = workbook.Sheets[sheet_name_list[0]];

var ids = [];

for (var rowname = 2; rowname < 1113; rowname++) {
    ids.push(rowname);
}

_.each(ids, function (rowname) {
    var piece = new Piece();

    piece.import_id = 1;

    piece.creator = 'nidarholm.1';

    var uln = 'A' + rowname;
    if (sheet[uln]) {
        piece.unique_number = sheet[uln].v;
    }

    var grn = 'B' + rowname;
    if (sheet[grn] && sheet[grn].v) {
        piece.record_number = sheet[grn].v;
    }

    var anr = 'C' + rowname;
    piece.archive_number = sheet[anr].v;

    var title = 'D' + rowname;
    piece.title = sheet[title].v;

    var subtitle = 'E' + rowname;
    if (sheet[subtitle] && sheet[subtitle].v) {
        piece.subtitle = sheet[subtitle].v;
    }

    var composer = 'F' + rowname;
    if (sheet[composer] && sheet[composer].v) {
        piece.composers = sheet[composer].v.split("/");
    }

    var arranger = 'G' + rowname;
    if (sheet[arranger] && sheet[arranger].v) {
        piece.arrangers = sheet[arranger].v.split("/");
    }

    var setup = 'H' + rowname;
    if (sheet[setup] && sheet[setup].v) {
        piece.band_setup = sheet[setup].v;
    }

    var short_genre = 'I' + rowname;
    if (sheet[short_genre] && sheet[short_genre].v) {
        piece.short_genre = sheet[short_genre].v;
    }

    var genre = 'J' + rowname;
    if (sheet[genre] && sheet[genre].v) {
        piece.genre = sheet[genre].v;
    }

    var published = 'K' + rowname;
    if (sheet[published] && sheet[published].v) {
        piece.published = sheet[published].v;
    }

    var bought = 'L' + rowname;
    if (sheet[bought] && sheet[bought].v) {
        piece.acquired = sheet[bought].v;
    }

    var concerts = 'M' + concerts;
    if (sheet[concerts] && sheet[concerts].v) {
        piece.concerts = sheet[concerts].v;
    }

    var maint = 'N' + rowname;
    piece.maintenance_status = sheet[maint].v;

    var comments = 'O' + rowname;
    if (sheet[comments] && sheet[comments].v) {
        piece.comments = sheet[comments].v;
    }

    var nationality = 'P' + rowname;
    if (sheet[nationality] && sheet[nationality].v) {
        piece.nationality = sheet[nationality].v;
    }

    var difficulty = 'Q' + rowname;
    if (sheet[difficulty] && sheet[difficulty].v) {
        piece.difficulty = sheet[difficulty].v;
    }

    var publisher = 'R' + rowname;
    if (sheet[publisher] && sheet[publisher].v) {
        piece.publisher = sheet[publisher].v;
    }

    piece._id = shortid();

    piece.save(function (err) {
        console.log(err, piece.archive_number);
    });
});

setTimeout(function () {
    mongoose.disconnect();
}, 10000);
