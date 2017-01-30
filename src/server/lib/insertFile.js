import fs from 'fs';
import path from 'path';
import mmmagic, { Magic } from 'mmmagic';
import File from '../models/File';
import Piece from '../models/Piece';
import findFilePath from './findFilePath';

export default function insertFile(filename, hex, permissions, tags, user, site, piece = null) {
    return new Promise((resolve, reject) => {
        const directory = path.join(findFilePath('originals'), hex.substr(0, 2), hex.substr(2, 2));
        const filePath = path.join(directory, hex);

        const magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
        fs.stat(filePath, (err, stats) => {
            if (err) { reject(err); }
            magic.detectFile(filePath, (err, mimetype) => {
                if (err) { reject(err); }
                const file = new File({
                    filename,
                    hash: hex,
                    mimetype,
                    size: stats.size,
                    permissions,
                    tags,
                    site,
                    creator: user,
                });

                file.save().then((_file) => {
                    if (piece) {
                        Piece.findByIdAndUpdate(
                            piece,
                            { $addToSet: { scores: _file.id } },
                            { new: true },
                        ).exec().then(() => {
                            resolve(_file);
                        });
                    }
                    else {
                        resolve(_file);
                    }
                });
            });
        });
    });
}
