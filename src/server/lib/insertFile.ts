import fs from "fs";
import mmmagic, { Magic } from "mmmagic";
import path from "path";
import { findDirectory } from "../../util";
import File from "../models/File";
import Piece from "../models/Piece";

export default function insertFile(
  filename: string,
  hex: string,
  permissions: string[],
  tags: string[],
  user: string,
  organization: string,
  piece = null,
) {
  return new Promise((resolve, reject) => {
    const directory = findDirectory("originals", hex);
    const filePath = path.join(directory, hex);

    const magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      }
      magic.detectFile(filePath, (err, mimetype) => {
        if (err) {
          reject(err);
        }
        const file = new File({
          filename,
          hash: hex,
          mimetype,
          size: stats.size,
          permissions,
          tags,
          organization,
          creator: user,
        });

        file.save().then((_file) => {
          if (piece) {
            Piece.findByIdAndUpdate(
              piece,
              { $addToSet: { scores: _file.id } },
              { new: true },
            )
              .exec()
              .then(() => {
                resolve(_file);
              });
          } else {
            resolve(_file);
          }
        });
      });
    });
  });
}
