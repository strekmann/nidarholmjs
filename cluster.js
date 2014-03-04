#!/usr/bin/env node
var app = require('./server/app'),
    http = require('http'),
    cluster = require('cluster'),
    numCPU = Math.floor(require('os').cpus().length / 3),
    i = 0;

if (app.settings.env === 'development') { numCPU = 2; }

if (cluster.isMaster){
    for (i; i<numCPU; i++){
        cluster.fork();
    }

    cluster.on('fork', function(worker){
        console.log('forked worker ' + worker.process.pid);
    });

    cluster.on('exit', function(worker, code, signal){
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });
} else {
    // -- database
    var mongoose = require('mongoose');
    console.log(app.conf.mongo);
    app.db = mongoose.connect(
        app.conf.mongo.servers.join(','),
        {replSet: {rs_name: app.conf.mongo.replset}}
    );

    // -- handle node exceptions
    process.on('uncaughtException', function(err){
        console.error('uncaughtException', err.message);
        console.error(err.stack);
        process.exit(1);
    });

    // -- start server
    http.createServer(app).listen(app.conf.port, function(){
        console.log("Express server listening on port %d in %s mode", app.conf.port, app.settings.env);
    });
}
