/* eslint "no-console": 0 */

import aws from "aws-sdk";
import crypto from "crypto";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

import async from "async";
import mkdirp from "mkdirp";
import mmmagic, { Magic } from "mmmagic";
import config from "../../config";

const s3 = new aws.S3({
  accessKeyId: config.spaces.keyId,
  secretAccessKey: config.spaces.secretKey,
  endpoint: config.spaces.endpoint,
});

function findDirectory(category, hash) {
  return path.join(category, hex.substr(0, 2), hex.substr(2, 2));
}

function createS3Uploader(localPath, fileContent) {
  const remotePath = path.join(config.spaces.pathPrefix, localPath);

  const upload = s3.upload({
    Bucket: config.spaces.bucketName,
    Key: remotePath,
    ACL: "public-read",
    Body: fileContent,
    ContentType: mimetype,
  });

  return upload;
}

function resize(hex, filepath) {
  return new Promise((resolve, reject) => {
    async.parallel(
      {
        large(callback) {
          // generate "large" sized image: max 1024 x max 640
          const directory = findDirectory("large", hex);
          mkdirp(directory, (err) => {
            if (err) {
              callback(err);
            } else {
              const largePath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 1024x640\\> -auto-orient ${largePath}`;
              exec(command, (err, stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(largePath);
                  const upload = createS3Uploader(largePath, fileContent);
                  return upload.send(() => {
                    return callback();
                  });
                }
              });
            }
          });
        },
        normal(callback) {
          // generate "normal" sized image: widthin 600x600
          const directory = findDirectory("normal", hex);
          mkdirp(directory, (err) => {
            if (err) {
              callback(err);
            } else {
              const normalPath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 600x600\\> -auto-orient ${normalPath}`;
              exec(command, (err, stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(normalPath);
                  const upload = createS3Uploader(normalPath, fileContent);
                  return upload.send(() => {
                    return callback();
                  });
                }
              });
            }
          });
        },
        thumbnail(callback) {
          // generate thumbnail
          const directory = findDirectory("thumbnails", hex);
          mkdirp(directory, (err) => {
            if (err) {
              callback(err);
            } else {
              const thumbnailPath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 220x220^ -gravity center -extent 220x220 -strip -auto-orient ${thumbnailPath}`;
              exec(command, (err, stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(thumbnailPath);
                  const upload = createS3Uploader(thumbnailPath, fileContent);
                  return upload.send(() => {
                    return callback();
                  });
                }
              });
            }
          });
        },
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    );
  });
}

export default function saveFile(tmpPath) {
  const magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
  return new Promise((resolve, reject) => {
    return fs.stat(tmpPath, (err, stats) => {
      if (err) {
        reject(err);
      }
      magic.detectFile(tmpPath, (err, mimetype) => {
        if (err) {
          reject(err);
        }

        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(tmpPath);
        stream.on("data", (data) => {
          hash.update(data);
        });
        stream.on("end", () => {
          const hex = hash.digest("hex");
          const directory = findDirectory("originals", hex);
          const filePath = path.join(directory, hex);

          fs.exists(filePath, (exists) => {
            if (exists) {
              resolve({ hex, mimetype, size: stats.size });
            }
            mkdirp(directory, (err) => {
              if (err) {
                reject(err);
              }

              const fileContent = fs.readFileSync(tmpPath);
              const upload = createS3Uploader(filePath, fileContent);

              return upload.send((err, results) => {
                if (err) {
                  return reject(err);
                }

                if (mimetype.match(/^image\/(png|jpeg|gif)/)) {
                  resize(hex, filePath).then(() => {
                    resolve({ hex, mimetype, size: stats.size });
                  });
                } else {
                  resolve({ hex, mimetype, size: stats.size });
                }
              });
            });
          });
        });
      });
    });
  });
}
