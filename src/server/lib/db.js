import Promise from 'bluebird';
import config from 'config';
import mongoose from 'mongoose';

mongoose.Promise = Promise;

if (process.env.NODE_ENV === 'test') {
    mongoose.connect('mongodb://localhost/test');
}
else {
    const servers = config.get('mongodb.servers') || ['localhost'];
    const replset = config.get('mongodb.replset') || null;
    mongoose.connect(servers.join(','), { replSet: { rs_name: replset } });
}
