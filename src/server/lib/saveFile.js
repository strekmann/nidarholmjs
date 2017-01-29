import async from 'async';
import crypto from 'crypto';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import mmmagic, { Magic } from 'mmmagic';
import findFilePath from './findFilePath';

function resize(hex, filepath) {
    return new Promise(
        (resolve, reject) => {
            async.parallel({
                large(callback) {
                    // generate "large" sized image: max 1024 x max 640
                    const directory = path.join(findFilePath('large'), hex.substr(0, 2), hex.substr(2, 2));
                    mkdirp(directory, (err) => {
                        if (err) { callback(err); }
                        else {
                            const largePath = path.join(directory, hex);
                            const command = `convert ${filepath} -resize 1024x640\\> -auto-orient ${largePath}`;
                            exec(command, (err, stdout, stderr) => {
                                if (err) {
                                    console.error(err, stderr);
                                    callback(err);
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                    });
                },
                normal(callback) {
                    // generate "normal" sized image: widthin 600x600
                    const directory = path.join(findFilePath('normal'), hex.substr(0, 2), hex.substr(2, 2));
                    mkdirp(directory, (err) => {
                        if (err) { callback(err); }
                        else {
                            const normalPath = path.join(directory, hex);
                            const command = `convert ${filepath} -resize 600x600\\> -auto-orient ${normalPath}`;
                            exec(command, (err, stdout, stderr) => {
                                if (err) {
                                    console.error(err, stderr);
                                    callback(err);
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                    });
                },
                thumbnail(callback) {
                    // generate thumbnail
                    const directory = path.join(findFilePath('thumbnails'), hex.substr(0, 2), hex.substr(2, 2));
                    mkdirp(directory, (err) => {
                        if (err) { callback(err); }
                        else {
                            const thumbnailPath = path.join(directory, hex);
                            const command = `convert ${filepath} -resize 220x220^ -gravity center -extent 220x220 -strip -auto-orient ${thumbnailPath}`;
                            exec(command, (err, stdout, stderr) => {
                                if (err) {
                                    console.error(err, stderr);
                                    callback(err);
                                }
                                else {
                                    callback();
                                }
                            });
                        }
                    });
                },
            }, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
    );
}

export default function saveFile(tmpPath) {
    const magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
    return new Promise(
        (resolve, reject) => fs.stat(tmpPath, (err, stats) => {
            if (err) { reject(err); }
            magic.detectFile(tmpPath, (err, mimetype) => {
                if (err) { reject(err); }

                const hash = crypto.createHash('sha256');
                const stream = fs.createReadStream(tmpPath);
                stream.on('data', (data) => {
                    hash.update(data);
                });
                stream.on('end', () => {
                    const hex = hash.digest('hex');
                    const directory = path.join(findFilePath('originals'), hex.substr(0, 2), hex.substr(2, 2));
                    const filePath = path.join(directory, hex);

                    fs.exists(filePath, (exists) => {
                        if (exists) {
                            resolve({ hex, mimetype, size: stats.size });
                        }
                        mkdirp(directory, (err) => {
                            if (err) { reject(err); }

                            // move file (or copy + unlink)
                            // fs.rename does not work from tmp to other partition
                            const is = fs.createReadStream(tmpPath);
                            const os = fs.createWriteStream(filePath);

                            is.pipe(os);
                            is.on('end', () => {
                                // remove tmp file
                                fs.unlinkSync(tmpPath);
                                if (mimetype.match(/^image\/(png|jpeg|gif)/)) {
                                    resize(hex, filePath).then(() => {
                                        resolve({ hex, mimetype, size: stats.size });
                                    });
                                }
                                else {
                                    resolve({ hex, mimetype, size: stats.size });
                                }
                            });
                        });
                    });
                });
            });
        }),
    );
}
