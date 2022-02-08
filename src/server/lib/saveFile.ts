import async from "async";
import aws from "aws-sdk";
import { exec } from "child_process";
import crypto from "crypto";
import fs from "fs";
import mkdirp from "mkdirp";
import mmmagic, { Magic } from "mmmagic";
import path from "path";
import config from "../../config";
import { findDirectory } from "../../util";

const s3 = new aws.S3({
  accessKeyId: config.spaces.keyId,
  secretAccessKey: config.spaces.secretKey,
  endpoint: config.spaces.endpoint,
});

function createS3Uploader(
  localPath: string,
  fileContent: Buffer,
  mimetype: string,
) {
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

function resize(
  hex: string,
  filepath: string,
  mimetype: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    async.parallel(
      {
        large(callback) {
          // generate "large" sized image: max 1024 x max 640
          const directory = findDirectory("large", hex);
          mkdirp(directory, (err: Error) => {
            if (err) {
              callback(err);
            } else {
              const largePath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 1024x640\\> -auto-orient ${largePath}`;
              exec(command, (err, _stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(largePath);
                  const upload = createS3Uploader(
                    largePath,
                    fileContent,
                    mimetype,
                  );
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
          mkdirp(directory, (err: Error) => {
            if (err) {
              callback(err);
            } else {
              const normalPath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 600x600\\> -auto-orient ${normalPath}`;
              exec(command, (err, _stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(normalPath);
                  const upload = createS3Uploader(
                    normalPath,
                    fileContent,
                    mimetype,
                  );
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
          mkdirp(directory, (err: Error) => {
            if (err) {
              callback(err);
            } else {
              const thumbnailPath = path.join(directory, hex);
              const command = `convert ${filepath} -resize 220x220^ -gravity center -extent 220x220 -strip -auto-orient ${thumbnailPath}`;
              exec(command, (err, _stdout, stderr) => {
                if (err) {
                  console.error(err, stderr);
                  callback(err);
                } else {
                  const fileContent = fs.readFileSync(thumbnailPath);
                  const upload = createS3Uploader(
                    thumbnailPath,
                    fileContent,
                    mimetype,
                  );
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

export default function saveFile(tmpPath: string): Promise<FileMetadata> {
  const magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
  return new Promise((resolve, reject) => {
    return fs.stat(tmpPath, (err, stats) => {
      if (err) {
        reject(err);
      }
      magic.detectFile(tmpPath, (err, _mimetype) => {
        if (err) {
          reject(err);
        }

        const mimetype = Array.isArray(_mimetype) ? _mimetype[0] : _mimetype;

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
            mkdirp(directory, (err: Error) => {
              if (err) {
                reject(err);
              }

              const fileContent = fs.readFileSync(tmpPath);
              const upload = createS3Uploader(filePath, fileContent, mimetype);

              return upload.send((err, _results) => {
                if (err) {
                  return reject(err);
                }

                if (mimetype.match(/^image\/(png|jpeg|gif)/)) {
                  resize(hex, tmpPath, mimetype).then(() => {
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

interface FileMetadata {
  hex: string;
  mimetype: string;
  size: number;
}
